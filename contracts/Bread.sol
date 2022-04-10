// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {IPool} from "./interfaces/IPool.sol";

contract Bread is ERC20, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    IERC20 public immutable reserveToken;
    IERC20 public immutable aReserveToken;
    IPool public immutable pool;

    event Minted(address sender, uint256 amount);
    event Burned(address sender, uint256 amount);

    constructor(
        address _reserveToken,
        address _aReserveToken,
        address _pool
    ) ERC20("Breadchain Stablecoin", "BREAD") {
        reserveToken = IERC20(_reserveToken);
        aReserveToken = IERC20(_aReserveToken);
        pool = IPool(_pool);
    }

    function mint(uint256 amount) external {
        require(amount > 0, "Bread: mint 0");
        IERC20 _reserveToken = reserveToken;
        IPool _pool = pool;
        _reserveToken.safeTransferFrom(msg.sender, address(this), amount);
        _reserveToken.safeIncreaseAllowance(address(_pool), amount);
        _pool.supply(address(_reserveToken), amount, address(this), 0);
        _mint(msg.sender, amount);
        emit Minted(msg.sender, amount);
    }

    function burn(uint256 amount) external nonReentrant {
        require(amount > 0, "Bread: burn 0");
        _burn(msg.sender, amount);
        IPool _pool = pool;
        aReserveToken.safeIncreaseAllowance(address(_pool), amount);
        _pool.withdraw(address(reserveToken), amount, msg.sender);
    }

    function withdrawYield(uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Bread: withdraw 0");
        uint256 yield = _yieldAccrued();
        require(yield >= amount, "Bread: amount exceeds yield accrued");
        pool.withdraw(address(reserveToken), amount, owner());
    }

    function withdrawToken(address token, uint256 amount) external onlyOwner {
        require(token != address(aReserveToken), "Bread: cannot withdraw collateral");
        IERC20(token).safeTransfer(owner(), amount);
    }

    function yieldAccrued() external view returns (uint256) {
        return _yieldAccrued();
    }

    function _yieldAccrued() internal view returns (uint256) {
        return aReserveToken.balanceOf(address(this)) - totalSupply();
    }
}
