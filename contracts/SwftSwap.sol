// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract SwftSwap is ReentrancyGuard, Ownable {
    using SafeMath for uint256;

    string public name;

    string public symbol;

    event Swap(
        address fromToken,
        string toToken,
        address sender,
        string destination,
        uint256 fromAmount,
        uint256 minReturnAmount
    );

    event SwapEth(
        string toToken,
        address sender,
        string destination,
        uint256 fromAmount,
        uint256 minReturnAmount
    );

    event WithdrawETH(uint256 amount);

    event Withdtraw(address token, uint256 amount);

    constructor() {
        name = "SWFT Swap1.1";
        symbol = "SSwap";
    }

    function swap(
        address fromToken,
        string memory toToken,
        string memory destination,
        uint256 fromAmount,
        uint256 minReturnAmount
    ) external nonReentrant {
        require(fromToken != address(0), "FROMTOKEN_CANT_T_BE_0");
        require(fromAmount > 0, "FROM_TOKEN_AMOUNT_MUST_BE_MORE_THAN_0");
        uint256 _inputAmount;
        // 获取当前合约的fromToken 数量
        uint256 _fromTokenBalanceOrigin = IERC20(fromToken).balanceOf(address(this));
        // 将用户的fromToken代币转入合约地址， fromAmount 数量
        (bool success, bytes memory data) = fromToken.call(abi.encodeWithSelector(0x23b872dd,msg.sender, address(this), fromAmount));
        // 校验是否转账成功
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: TRANSFER_FROM_FAILED');
        // 获取当前合约的fromToken 数量
        uint256 _fromTokenBalanceNew = IERC20(fromToken).balanceOf(address(this));
        // 目前金额 - 之前金额 = 用户转入的金额
        _inputAmount = _fromTokenBalanceNew.sub(_fromTokenBalanceOrigin);
        // 
        require(_inputAmount > 0, "NO_FROM_TOKEN_TRANSFER_TO_THIS_CONTRACT");
        // 日志
        emit Swap(fromToken, toToken, msg.sender, destination, fromAmount, minReturnAmount);
    }

    function swapEth(string memory toToken, string memory destination, uint256 minReturnAmount
    ) external payable nonReentrant {
        // 存主币 eth
        uint256 _ethAmount = msg.value;
        require(_ethAmount > 0, "ETH_AMOUNT_MUST_BE_MORE_THAN_0");
        emit SwapEth(toToken, msg.sender, destination, _ethAmount, minReturnAmount);
    }

    function withdrawETH(address destination, uint256 amount) external onlyOwner {
        require(destination != address(0), "DESTINATION_CANNT_BE_0_ADDRESS");
        uint256 balance = address(this).balance;
        require(balance >= amount, "AMOUNT_CANNT_MORE_THAN_BALANCE");
        (bool success,) = destination.call{value:amount}(new bytes(0));
        require(success, 'TransferHelper: ETH_TRANSFER_FAILED');
        emit WithdrawETH(amount);
    }

    function withdraw(address token, address destination, uint256 amount) external onlyOwner {
        // 目标地址
        require(destination != address(0), "DESTINATION_CANNT_BE_0_ADDRESS");
        // 代币地址
        require(token != address(0), "TOKEN_MUST_NOT_BE_0");
        // 合约地址的代币数量
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance >= amount, "AMOUNT_CANNT_MORE_THAN_BALANCE");

        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0xa9059cbb, destination, amount));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: TRANSFER_FAILED');
        emit Withdtraw(token, amount);
    }

    // 接受主币，可以直接往合约方法里存主币
    receive() external payable {}
}
