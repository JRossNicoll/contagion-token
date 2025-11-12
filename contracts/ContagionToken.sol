// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ContagionToken
 * @notice Custom reflection token with script-controlled proxy wallet distribution
 * @dev Implements dual balance system: base balance + reflection balance
 */
contract ContagionToken is ERC20, Ownable, ReentrancyGuard {
    // Token Configuration
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**9; // 1 billion with 9 decimals
    uint256 public constant MAX_PROXIES = 4;
    
    // Tax Configuration
    uint256 public reflectionTaxRate = 5; // 5%
    uint256 public gasTaxRate = 1; // 1%
    uint256 public constant TAX_DENOMINATOR = 100;
    
    // Transaction Limits
    uint256 public maxTransactionAmount = (TOTAL_SUPPLY * 2) / 100; // 2%
    uint256 public maxWalletAmount = (TOTAL_SUPPLY * 2) / 100; // 2%
    bool public limitsRemoved = false;
    
    // Reflection Configuration
    uint256 public snapshotThreshold = 1; // 1% of supply
    uint256 public minimumHolderBalance = 100 * 10**9; // 100 tokens
    
    // Addresses
    address public reflectionPool;
    address public gasPool;
    address public dexRouter;
    
    // Snapshot tracking
    uint256 public currentSnapshotId;
    
    // Anti-bot: sells per block tracking
    mapping(address => mapping(uint256 => uint256)) private _sellsPerBlock;
    uint256 public constant MAX_SELLS_PER_BLOCK = 3;
    
    // Balance tracking
    mapping(address => uint256) private _baseBalances;
    mapping(address => uint256) private _reflectionBalances;
    
    // Proxy wallet mapping
    mapping(address => address[MAX_PROXIES]) public proxyWallets;
    
    // Exclusions
    mapping(address => bool) public isExcludedFromTax;
    mapping(address => bool) public isExcludedFromReflections;
    mapping(address => bool) public isExcludedFromLimits;
    
    // Events
    event SnapshotTaken(uint256 indexed snapshotId, uint256 amount, uint256 timestamp);
    event ProxyWalletsSet(address indexed holder, address[MAX_PROXIES] proxies);
    event ReflectionsDistributed(uint256 indexed snapshotId, uint256 totalAmount, uint256 recipientCount);
    event TaxRatesUpdated(uint256 reflectionTax, uint256 gasTax);
    event LimitsRemoved();
    event PoolAddressUpdated(string poolType, address newAddress);
    
    constructor(
        string memory name,
        string memory symbol,
        address _reflectionPool,
        address _gasPool,
        address _dexRouter
    ) ERC20(name, symbol) Ownable(msg.sender) {
        require(_reflectionPool != address(0), "Invalid reflection pool");
        require(_gasPool != address(0), "Invalid gas pool");
        require(_dexRouter != address(0), "Invalid DEX router");
        
        reflectionPool = _reflectionPool;
        gasPool = _gasPool;
        dexRouter = _dexRouter;
        
        // Exclude system addresses
        isExcludedFromTax[owner()] = true;
        isExcludedFromTax[address(this)] = true;
        isExcludedFromTax[reflectionPool] = true;
        isExcludedFromTax[gasPool] = true;
        isExcludedFromTax[dexRouter] = true;
        
        isExcludedFromReflections[owner()] = true;
        isExcludedFromReflections[address(this)] = true;
        isExcludedFromReflections[reflectionPool] = true;
        isExcludedFromReflections[gasPool] = true;
        isExcludedFromReflections[dexRouter] = true;
        
        isExcludedFromLimits[owner()] = true;
        isExcludedFromLimits[address(this)] = true;
        isExcludedFromLimits[reflectionPool] = true;
        isExcludedFromLimits[gasPool] = true;
        isExcludedFromLimits[dexRouter] = true;
        
        // Mint total supply to owner
        _baseBalances[owner()] = TOTAL_SUPPLY;
        emit Transfer(address(0), owner(), TOTAL_SUPPLY);
    }
    
    /**
     * @notice Returns 9 decimals
     */
    function decimals() public pure override returns (uint8) {
        return 9;
    }
    
    /**
     * @notice Returns the total token supply
     */
    function totalSupply() public pure override returns (uint256) {
        return TOTAL_SUPPLY;
    }
    
    /**
     * @notice Returns combined balance (base + reflections)
     */
    function balanceOf(address account) public view override returns (uint256) {
        return _baseBalances[account] + _reflectionBalances[account];
    }
    
    /**
     * @notice Returns base balance only
     */
    function baseBalanceOf(address account) public view returns (uint256) {
        return _baseBalances[account];
    }
    
    /**
     * @notice Returns reflection balance only
     */
    function reflectionBalanceOf(address account) public view returns (uint256) {
        return _reflectionBalances[account];
    }
    
    /**
     * @notice Override transfer with tax and limits logic
     */
    function _update(address from, address to, uint256 amount) internal override nonReentrant {
        require(from != address(0), "Transfer from zero address");
        require(to != address(0), "Transfer to zero address");
        require(amount > 0, "Transfer amount must be greater than zero");
        
        // Anti-bot: check sells per block
        if (from != owner() && to == dexRouter) {
            uint256 currentBlock = block.number;
            _sellsPerBlock[from][currentBlock]++;
            require(_sellsPerBlock[from][currentBlock] <= MAX_SELLS_PER_BLOCK, "Max sells per block exceeded");
        }
        
        // Check transaction limits
        if (!limitsRemoved && !isExcludedFromLimits[from] && !isExcludedFromLimits[to]) {
            require(amount <= maxTransactionAmount, "Exceeds max transaction amount");
            if (to != dexRouter) {
                require(balanceOf(to) + amount <= maxWalletAmount, "Exceeds max wallet amount");
            }
        }
        
        require(balanceOf(from) >= amount, "Insufficient balance");
        
        uint256 transferAmount = amount;
        
        // Apply taxes
        if (!isExcludedFromTax[from] && !isExcludedFromTax[to] && (from == dexRouter || to == dexRouter)) {
            uint256 reflectionTax = (amount * reflectionTaxRate) / TAX_DENOMINATOR;
            uint256 gasTax = (amount * gasTaxRate) / TAX_DENOMINATOR;
            uint256 totalTax = reflectionTax + gasTax;
            
            transferAmount = amount - totalTax;
            
            uint256 fromBaseBalance = _baseBalances[from];
            
            if (fromBaseBalance >= amount) {
                // All from base balance
                _baseBalances[from] -= amount;
            } else {
                // Split between base and reflection
                uint256 fromReflection = amount - fromBaseBalance;
                _baseBalances[from] = 0;
                _reflectionBalances[from] -= fromReflection;
            }
            
            _baseBalances[to] += transferAmount;
            
            _baseBalances[reflectionPool] += reflectionTax;
            _baseBalances[gasPool] += gasTax;
            
            emit Transfer(from, reflectionPool, reflectionTax);
            emit Transfer(from, gasPool, gasTax);
            emit Transfer(from, to, transferAmount);
            
            return;
        }
        
        uint256 senderBaseBalance = _baseBalances[from];
        
        if (senderBaseBalance >= amount) {
            _baseBalances[from] -= amount;
            _baseBalances[to] += amount;
        } else {
            uint256 fromReflection = amount - senderBaseBalance;
            _baseBalances[from] = 0;
            _reflectionBalances[from] -= fromReflection;
            _baseBalances[to] += amount;
        }
        
        emit Transfer(from, to, amount);
    }
    
    /**
     * @notice Take a snapshot of the current reflection pool
     * @return snapshotId The ID of the snapshot
     * @return amount The amount locked in the snapshot
     */
    function takeSnapshot() external onlyOwner returns (uint256 snapshotId, uint256 amount) {
        amount = _baseBalances[reflectionPool];
        require(amount > 0, "No reflections to snapshot");
        
        currentSnapshotId++;
        snapshotId = currentSnapshotId;
        
        emit SnapshotTaken(snapshotId, amount, block.timestamp);
        
        return (snapshotId, amount);
    }
    
    /**
     * @notice Set proxy wallets for a holder
     * @param holder The holder address
     * @param proxies Array of up to 4 proxy addresses
     */
    function setProxyWallets(address holder, address[MAX_PROXIES] calldata proxies) external onlyOwner {
        require(holder != address(0), "Invalid holder address");
        
        for (uint256 i = 0; i < MAX_PROXIES; i++) {
            proxyWallets[holder][i] = proxies[i];
        }
        
        emit ProxyWalletsSet(holder, proxies);
    }
    
    /**
     * @notice Distribute reflections to multiple recipients
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to distribute
     */
    function distributeReflections(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyOwner {
        require(recipients.length == amounts.length, "Array length mismatch");
        require(recipients.length > 0, "No recipients");
        
        uint256 totalAmount = 0;
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            require(amounts[i] > 0, "Invalid amount");
            
            _reflectionBalances[recipients[i]] += amounts[i];
            totalAmount += amounts[i];
        }
        
        // Deduct from reflection pool
        require(_baseBalances[reflectionPool] >= totalAmount, "Insufficient pool balance");
        _baseBalances[reflectionPool] -= totalAmount;
        
        emit ReflectionsDistributed(currentSnapshotId, totalAmount, recipients.length);
    }
    
    // Configuration Functions
    
    function setSnapshotThreshold(uint256 percentage) external onlyOwner {
        require(percentage > 0 && percentage <= 10, "Invalid threshold");
        snapshotThreshold = percentage;
    }
    
    function setMinimumHolderBalance(uint256 amount) external onlyOwner {
        minimumHolderBalance = amount;
    }
    
    function setTaxRates(uint256 _reflectionTax, uint256 _gasTax) external onlyOwner {
        require(_reflectionTax + _gasTax <= 10, "Total tax too high");
        reflectionTaxRate = _reflectionTax;
        gasTaxRate = _gasTax;
        emit TaxRatesUpdated(_reflectionTax, _gasTax);
    }
    
    function setMaxTransaction(uint256 percentage) external onlyOwner {
        require(percentage >= 1 && percentage <= 100, "Invalid percentage");
        maxTransactionAmount = (TOTAL_SUPPLY * percentage) / 100;
    }
    
    function setMaxWallet(uint256 percentage) external onlyOwner {
        require(percentage >= 1 && percentage <= 100, "Invalid percentage");
        maxWalletAmount = (TOTAL_SUPPLY * percentage) / 100;
    }
    
    function removeLimits() external onlyOwner {
        limitsRemoved = true;
        emit LimitsRemoved();
    }
    
    function setReflectionPool(address pool) external onlyOwner {
        require(pool != address(0), "Invalid address");
        reflectionPool = pool;
        emit PoolAddressUpdated("reflection", pool);
    }
    
    function setGasPool(address pool) external onlyOwner {
        require(pool != address(0), "Invalid address");
        gasPool = pool;
        emit PoolAddressUpdated("gas", pool);
    }
    
    function setRouter(address router) external onlyOwner {
        require(router != address(0), "Invalid address");
        dexRouter = router;
    }
    
    function excludeFromTax(address wallet, bool excluded) external onlyOwner {
        isExcludedFromTax[wallet] = excluded;
    }
    
    function excludeFromReflections(address wallet, bool excluded) external onlyOwner {
        isExcludedFromReflections[wallet] = excluded;
    }
    
    function excludeFromLimits(address wallet, bool excluded) external onlyOwner {
        isExcludedFromLimits[wallet] = excluded;
    }
    
    // Emergency Functions
    
    function rescueTokens(address token, uint256 amount) external onlyOwner {
        require(token != address(this), "Cannot rescue own token");
        IERC20(token).transfer(owner(), amount);
    }
    
    function rescueETH(uint256 amount) external onlyOwner {
        payable(owner()).transfer(amount);
    }
    
    function withdrawReflectionPool(uint256 amount) external onlyOwner {
        require(_baseBalances[reflectionPool] >= amount, "Insufficient balance");
        _baseBalances[reflectionPool] -= amount;
        _baseBalances[owner()] += amount;
        emit Transfer(reflectionPool, owner(), amount);
    }
    
    function withdrawGasPool(uint256 amount) external onlyOwner {
        require(_baseBalances[gasPool] >= amount, "Insufficient balance");
        _baseBalances[gasPool] -= amount;
        _baseBalances[owner()] += amount;
        emit Transfer(gasPool, owner(), amount);
    }
    
    receive() external payable {}
}
