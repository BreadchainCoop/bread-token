import { ethers, Contract } from "ethers";
import fs from 'fs';
import BreadABI from "../artifacts/contracts/Bread.sol/Bread.json"
import * as dotenv from 'dotenv';
dotenv.config();
import { createObjectCsvWriter } from 'csv-writer';

const RPC_URL = process.env.RPC_URL || "";
if (RPC_URL === "") {
    throw new Error("RPC_URL is not set in .env file");
}
async function getSmartContractCount(tokenAddress: string) {
    // open csv file 
    const smartContractCsvWriter = createObjectCsvWriter({
        path: 'smart_contracts_with_balance.csv',
        header: [
            { id: 'address', title: 'ADDRESS' },
            { id: 'balance', title: 'BALANCE' },
        ],
    });

    const nonSmartContractCsvWriter = createObjectCsvWriter({
        path: 'non_smart_contracts_with_balance.csv',
        header: [
            { id: 'address', title: 'ADDRESS' },
            { id: 'balance', title: 'BALANCE' },
        ],
    });
    let smartContractData = [];
    let nonSmartContractData = [];

    let smartContractCount = 0;
    const provider = new ethers.providers.JsonRpcProvider(
        RPC_URL
    );
    // Connect to the ERC-20 token contract
    const tokenContract = new Contract(
        tokenAddress,
        BreadABI.abi,
        provider
        );
    const currentBlock = await provider.getBlockNumber();
    const allEvents: ethers.providers.Log[] = [];
    const intervals = [
        { from: 0x19bb689, to: 0x1f4f8fc },
        { from: 0x1f4f8fc, to: 0x2379a1d },
        { from: 0x2379a1d, to: 0x26992f6 },
        { from: 0x26992f6, to: 50298243 },
        { from: 50298243, to: currentBlock },
    ];
    for (const interval of intervals) {
        const Events = await provider.getLogs({
            address: tokenAddress,
            fromBlock: interval.from,
            toBlock: interval.to,
        });

        allEvents.push(...Events);
    }
    // print the length of all events
    console.log("Total events: ", allEvents.length);
    const parsed_events = allEvents.map((log) => {
        try {
            return tokenContract.interface.parseLog({ topics: log.topics.slice(), data: log.data });
        } catch (error) {
            if ((error as { value: string }).value === '0x5570d70a002632a7b0b3c9304cc89efb62d8da9eca0dbd7752c83b7379068296') {
                //handling for a proxy transfer ownership event not included in the ABI but can be observed here https://polygonscan.com/tx/0x290a5ffc072b9fe571c9827f877a8a73d5ffd25b7668e8c4ee91e0420801f703
                return null;
            }
        }
    });
    const non_null_events = parsed_events.filter((log) => log !== undefined && log !== null);
    console.log("Total parsed and non null events: ", non_null_events.length);
    const transferAddresses = non_null_events.map((log) => log!.args[1]);
    const unique_addresses = [...new Set([...transferAddresses])];
    const unique_holders = unique_addresses.filter((address) => ethers.utils.isAddress(address));
    console.log("Unique holders length:", unique_holders.length);
    const total_supply_from_view_method = await tokenContract.totalSupply();
    let total_supply_sanity_check = BigInt(0);
    for (const address of unique_holders) {
        try{
            const balance = BigInt(await tokenContract.balanceOf(address));
            const code = await provider.getCode(address);
            if (code !== "0x" && balance > 0) {
                smartContractData.push({ address, balance: balance});
                total_supply_sanity_check = total_supply_sanity_check + balance;
                smartContractCount++;
            } else if (balance > 0) { // Assuming you only care about accounts with a balance
                nonSmartContractData.push({ address, balance: balance.toString() });
                total_supply_sanity_check += balance;
            }
        }
        catch(error){
            console.log("Error", error);
        }
    }
    console.log("Total supply from written accounts: ", total_supply_sanity_check.toString());
    console.log("Total supply from view method: ", total_supply_from_view_method.toString());
    if (total_supply_sanity_check.toString() !== total_supply_from_view_method.toString()) {
        console.log("Total supply from written accounts and view method do not match");
        process.exit(1);
    }
    else{
        console.log("Total supply from written accounts and view method match");

    }
    console.log("Smart contract count:" ,smartContractCount);
        
    // Writing to CSV files
    await smartContractCsvWriter.writeRecords(smartContractData)
        .then(() => console.log('Smart contract accounts with balance have been written to CSV file.'));

    await nonSmartContractCsvWriter.writeRecords(nonSmartContractData)
        .then(() => console.log('Non-smart contract accounts with balance have been written to CSV file.'));
    // Create a json file with the same data 
    const jsonContent = JSON.stringify(smartContractData);
    fs.writeFile("smart_contracts_with_balance.json", jsonContent, 'utf8', function (err: any) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
        console.log("Smart contract accounts with balance has been saved.");
    });

    const nonSmartContractJsonContent = JSON.stringify(nonSmartContractData);
    fs.writeFile("non_smart_contracts_with_balance.json", nonSmartContractJsonContent, 'utf8', function (err: any) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
        console.log("Non-smart contract accounts with balance has been saved.");
    });
    process.exit(0);
}

getSmartContractCount("0x11d9efDf4Ab4A3bfabf5C7089F56AA4F059AA14C");