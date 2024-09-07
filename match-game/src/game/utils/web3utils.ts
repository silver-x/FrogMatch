// Import everything
import { ethers } from "ethers";
import { contractABI, contractAddress, GameContractABI, GameContractAddress } from "../data/ConstData";
import { randomInt } from "./utils";

export async function getProvider() {
    const provider = new ethers.BrowserProvider(window.ethereum)
    return provider;
}

// export async function getProvider0() {
//     const provider = new ethers.JsonRpcProvider('https://linea-sepolia.infura.io/v3/5615dacfdea74cc3bff2e8cae125900e');
//     return provider;
// }

export async function ensureCorrectNetwork() {
    const desiredChainId = "0xe705";
    try {
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: desiredChainId }],
        });
    } catch (error) {
        if (error.code === 4902) {
            await addNetwork(desiredChainId);
        } else {
            console.error("Network switch failed:", error);
        }
    }
};

export async function addNetwork(chainId) {
    try {
        await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
                {
                    chainId,
                    chainName: "Linea Sepolia test network",
                    rpcUrls: ["https://linea-sepolia.infura.io/v3/"],
                    nativeCurrency: {
                        name: "LineaETH",
                        symbol: "LineaETH",
                        decimals: 18,
                    },
                    blockExplorerUrls: ["https://sepolia.lineascan.build"],
                },
            ],
        });
    } catch (error) {
        console.error("Failed to add network:", error);
    }
};
export async function Init() {
    await ensureCorrectNetwork();
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
}


export async function checkWeb3Network() : Promise<boolean>{

    // 检查用户是否安装了MetaMask
    if (window.ethereum) {
        // 创建MetaMask提供者实例
        const provider = new ethers.BrowserProvider(window.ethereum)
        async function checkNetwork() {
            try {
                // 获取当前网络ID
                const currentChainId = await provider.getNetwork().then(network => network.chainId);

                // 期望的网络ID，例如以太坊主网为1
                const desiredChainId:bigint = BigInt(59141);

                // 检查是否在正确的网络
                if (currentChainId !== desiredChainId) {
                    // 如果不在正确的网络，提示用户切换网络
                    // alert(`请切换到以linea-sepolia网（网络ID: ${desiredChainId}）`);
                    return false;
                } else {
                    // 执行需要在特定网络上的操作
                    console.log('在正确的网络上，继续操作...');
                    return true;
                }
            } catch (error) {
                console.error('检查网络时出错:', error);
            }
        }

        // 监听网络变化事件
        window.ethereum.on('chainChanged', (chainId) => {
            console.log(`网络已切换到: ${chainId}`);
            // 可以在这里更新应用状态或重新检查网络
        });

        // 初始检查网络
        const flag = await checkNetwork();
        return flag!;
    } else {
        // alert('请安装MetaMask扩展');
    }
    return false;
}

export function w3ToNumber(num:any){
    return Number(num.toString());
}

export async function toBigInt(str:any) {
    const bigNumberValue = ethers.toBigInt(str);
    return bigNumberValue;
}


// game utils
export async function getPlayer(){
    try {
        // 签名
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner();
        const signerOnlyContract = new ethers.Contract(GameContractAddress, GameContractABI, signer);
        const player = await signerOnlyContract.getPlayer();
        console.log("player => " + player);

        return player;
    }catch (error) {
        console.log("getPlayer error => ", error);
    }
    return {user:"",coin:0,box:0};
}

export async function buyBoxByContract(index:number) {
    console.log("buyBoxByContract");
    // 签名
    const provider = await getProvider();//new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner();
    const signerOnlyContract = new ethers.Contract(GameContractAddress, GameContractABI, signer);

    const transactionResponse = await signerOnlyContract.buyBox(BigInt(index),BigInt(randomInt(1000000000)));
    const receipt = await transactionResponse.wait(); // 使用 await
    console.log('合约函数返回:', receipt);

    const returnValue1 = receipt.logs[1].args;
    console.log('合约事件返回值:', returnValue1);

    const player = receipt.logs[1].args[2];
    console.log('合约事件返回值2:', player);

    return player;
}

export async function buyBoxByContractWithGas2(index:number){
    const provider = await getProvider();
    const signer = await provider.getSigner();
    const signerOnlyContract = new ethers.Contract(GameContractAddress, GameContractABI, signer);
    console.log("buyBoxByContractWithGas2");
    //
    // 准备调用的合约函数和参数
    const functionName = "buyBox";  
    const params = [BigInt(index),BigInt(randomInt(1000000000))];  

    // 增加额外的 gas 以确保交易成功

    const extraGas = ethers.toBigInt("202000");
    const finalGasLimit = extraGas;

    console.log("finalGasLimit gas:", finalGasLimit);
        
    // 构建交易
    const tx = {
    to: GameContractAddress,
    data: await signerOnlyContract.interface.encodeFunctionData(functionName, params),
    gasLimit: finalGasLimit,
    };
     
     // 发送交易
     const transactionResponse = await signer.sendTransaction(tx);
     
     // 等待交易被挖掘
     const receipt = await transactionResponse.wait();
     console.log("Transaction receipt:", receipt);

     // 尝试解码日志
     const decodedLog = signerOnlyContract.interface.parseLog(receipt?.logs[receipt?.logs.length - 1]!);
     if(decodedLog){
        console.log("decodedLog => ", decodedLog);
        const player = decodedLog.args[2];
        return player;
     }
    return undefined;
}

export async function openBoxByContract(arr:any[9]) {
    // 签名
    const provider = await getProvider();
    const signer = await provider.getSigner();
    const signerOnlyContract = new ethers.Contract(GameContractAddress, GameContractABI, signer);

    const transactionResponse = await signerOnlyContract.openBox(arr);
    const receipt = await transactionResponse.wait(); // 使用 await
    console.log('transactionResponse => ', receipt);

    const returnValue1 = receipt.logs[0].args;
    console.log('args => ', returnValue1);

    // 
    const array = receipt.logs[0].args[4];
    // for(let i = 0 ; i < 9 ; i++){
    //     const num = w3ToNumber(array[i]);
    //     if(num != 255){
    //         arr1.push(num);
    //     }
    // }
    console.log('array => ', array);

    return array;
}

export async function openBoxByContractWithGas(arr:any[9]) {
 
    const provider = await getProvider();
    const signer = await provider.getSigner();
    const signerOnlyContract = new ethers.Contract(GameContractAddress, GameContractABI, signer);

    // 准备调用的合约函数和参数
    const functionName = "openBox";
    const params = [arr];

    
    // 估算 gas
    const estimatedGas = await signerOnlyContract[functionName].estimateGas(...params);
    
    console.log("Estimated gas:", estimatedGas);


    // 增加额外的 gas 以确保交易成功
    
    const extraGas = ethers.toBigInt("5000"); // 例如，增加 10000 单位的 gas
    const finalGasLimit = estimatedGas + extraGas;

    console.log("finalGasLimit gas:", finalGasLimit);
        
    // 构建交易
    const tx = {
      to: GameContractAddress,
      data: await signerOnlyContract.interface.encodeFunctionData(functionName, params),
      gasLimit: finalGasLimit,
    };
    
    // 发送交易
    const transactionResponse = await signer.sendTransaction(tx);
    
    // 等待交易被挖掘
    const receipt = await transactionResponse.wait();
    
    console.log("Transaction receipt:", receipt);
}

export async function openBoxByContractWithGas2(arr:any[9]){

    console.log("openBoxByContractWithGas2 1");
    const provider = await getProvider();
    const signer = await provider.getSigner();
    const signerOnlyContract = new ethers.Contract(GameContractAddress, GameContractABI, signer);
    console.log("openBoxByContractWithGas2 4");
    //
    // 准备调用的合约函数和参数
    const functionName = "openBox";  
    const params = [arr];  

    // 增加额外的 gas 以确保交易成功

    const extraGas = ethers.toBigInt("202000");
    const finalGasLimit = extraGas;

    console.log("finalGasLimit gas:", finalGasLimit);
        
    // 构建交易
    const tx = {
    to: GameContractAddress,
    data: await signerOnlyContract.interface.encodeFunctionData(functionName, params),
    gasLimit: finalGasLimit,
    };
     
     // 发送交易
     const transactionResponse = await signer.sendTransaction(tx);
     
     // 等待交易被挖掘
     const receipt = await transactionResponse.wait();
     console.log("Transaction receipt:", receipt);

     // 尝试解码日志
     const decodedLog = signerOnlyContract.interface.parseLog(receipt?.logs[receipt?.logs.length - 1]!);
     if(decodedLog){
        console.log("decodedLog => ", decodedLog);
        const player = decodedLog.args[2];
        return player;
     }
    return undefined;
}

export async function receiveByContractWithGas() {

    console.log("receiveByContractWithGas 1");
    const provider = await getProvider();
    const signer = await provider.getSigner();
    const signerOnlyContract = new ethers.Contract(GameContractAddress, GameContractABI, signer);
    console.log("receiveByContractWithGas 4");
    //
    // 准备调用的合约函数和参数
    const functionName = "getTestTokens";  
    const params = [];  

    // 增加额外的 gas 以确保交易成功

    const extraGas = ethers.toBigInt("302000");
    const finalGasLimit = extraGas;

    console.log("finalGasLimit gas:", finalGasLimit);
        
    // 构建交易
    const tx = {
    to: GameContractAddress,
    data: await signerOnlyContract.interface.encodeFunctionData(functionName, params),
    gasLimit: finalGasLimit,
    };
     
     // 发送交易
     const transactionResponse = await signer.sendTransaction(tx);
     
     // 等待交易被挖掘
     const receipt = await transactionResponse.wait();
     console.log("Transaction receipt:", receipt);

     // 尝试解码日志
     const decodedLog = signerOnlyContract.interface.parseLog(receipt?.logs[receipt?.logs.length - 1]!);
     if(decodedLog){
        console.log("decodedLog => ", decodedLog);
        const coin = decodedLog.args[3];
        return coin;
     }
    return 0;
}

export async function receiveByContract() {
    const provider = await getProvider();
    const signer = await provider.getSigner();
    const signerOnlyContract = new ethers.Contract(GameContractAddress, GameContractABI, signer);

    const transactionResponse = await signerOnlyContract.getTestTokens();
    const receipt = await transactionResponse.wait(); // 使用 await
    console.log('transactionResponse => ', receipt);

    const returnValue1 = receipt.logs[1].args;
    console.log('args => ', returnValue1);

    const player = receipt.logs[1].args[2];
    console.log('player => ', player);

    const coin = receipt.logs[1].args[3];
    console.log('coin => ', player);
    return coin;
}

export async function withdrawByContract() {
    const provider = await getProvider();
    const signer = await provider.getSigner();
    const signerOnlyContract = new ethers.Contract(GameContractAddress, GameContractABI, signer);

    const transactionResponse = await signerOnlyContract.withdraw();
    const receipt = await transactionResponse.wait(); // 使用 await
    console.log('transactionResponse => ', receipt);

    const returnValue1 = receipt.logs[1].args;
    console.log('args => ', returnValue1);

    const player = receipt.logs[1].args[2];
    console.log('player => ', player);

    const coin = receipt.logs[1].args[3];
    console.log('coin => ', player);
    return coin;
}

// erc20
export async function balanceOf(address:string){
    const provider = await getProvider();
    const signer = await provider.getSigner();
    const signerOnlyContract = new ethers.Contract(contractAddress, contractABI, signer);
    const balance = await signerOnlyContract.balanceOf(address);
    console.log("balance => " + balance);
    return balance;
}

export async function balance(address:string){
    const provider = await getProvider();
    const balance = await provider.getBalance(address);
    console.log("balance => " + balance);
    return balance;
}

export async function testTransfer(){
    const provider = await getProvider();
    const signer = await provider.getSigner();
    const signerOnlyContract = new ethers.Contract(contractAddress, contractABI, signer);
    await signerOnlyContract.transfer("0x0d2aa26Cb57c84b3086EE605E3F9624d0afAAC8F",1);
}


// allowance
export async function allowance(owner:string, spender:string){
    const provider = await getProvider();
    const signer = await provider.getSigner();
    const signerOnlyContract = new ethers.Contract(contractAddress, contractABI, signer);
    const balance = await signerOnlyContract.allowance(owner,spender);
    console.log("allowance => " + balance);
    return balance;
}

// approve
export async function approve(spender:string, amount:number){
    const provider = await getProvider();
    const signer = await provider.getSigner();
    const signerOnlyContract = new ethers.Contract(contractAddress, contractABI, signer);
    const balance = await signerOnlyContract.approve(spender,amount);
    console.log("approve => " + balance);
    return balance;
}