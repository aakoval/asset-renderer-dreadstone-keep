'use strict'

const ethers = require("ethers");
const Web3 = require('web3');
const fs = require('fs');

class NFT {
  constructor() {
    this.ApiURL = process.env.API_URL
    this.Contracts = {
      avatar: process.env.AVATAR_CONTRACT,
      item: process.env.ITEM_CONTRACT,
      gem: process.env.GEM_CONTRACT
    }
    this.ContractABI = [
      "event Approval(address indexed,address indexed,uint256 indexed)",
      "event ApprovalForAll(address indexed,address indexed,bool)",
      "event OwnershipTransferred(address indexed,address indexed)",
      "event Transfer(address indexed,address indexed,uint256 indexed)",
      "function approve(address,uint256)",
      "function balanceOf(address) view returns (uint256)",
      "function getApproved(uint256) view returns (address)",
      "function isApprovedForAll(address,address) view returns (bool)",
      "function name() view returns (string)",
      "function owner() view returns (address)",
      "function ownerOf(uint256) view returns (address)",
      "function renounceOwnership()",
      "function safeMint(address,string)",
      "function safeTransferFrom(address,address,uint256)",
      "function safeTransferFrom(address,address,uint256,bytes)",
      "function setApprovalForAll(address,bool)",
      "function supportsInterface(bytes4) view returns (bool)",
      "function symbol() view returns (string)",
      "function tokenByIndex(uint256) view returns (uint256)",
      "function tokenOfOwnerByIndex(address,uint256) view returns (uint256)",
      "function tokenURI(uint256) view returns (string)",
      "function totalSupply() view returns (uint256)",
      "function transferFrom(address,address,uint256)",
      "function transferOwnership(address)"
    ]
  }
  async get (type, id) {
    try {
      const web3 = new Web3(new Web3.providers.HttpProvider(this.ApiURL));

      const tokenURIABI = [
          {
              "inputs": [
                  {
                      "internalType": "uint256",
                      "name": "tokenId",
                      "type": "uint256"
                  }
              ],
              "name": "tokenURI",
              "outputs": [
                  {
                      "internalType": "string",
                      "name": "",
                      "type": "string"
                  }
              ],
              "stateMutability": "view",
              "type": "function"
          }
      ];

      const contract = new web3.eth.Contract(tokenURIABI, this.Contracts[type])

      console.log(contract)

      const tokenURI = await contract.methods.tokenURI(id).call()
      
      console.log(tokenURI)

      const result = this._parseHexString(tokenURI)

      // const result = hexToBinary(tokenURI)
      const rJson = this._binToJson(result);

      // const provider = new ethers.providers.JsonRpcProvider(this.ApiURL);
  
      // const contract = new ethers.Contract(this.Contracts[type], this.ContractABI, provider)

      // const tokenURI = await contract.tokenURI(id)
      
      // console.log(tokenURI)
      
      return rJson;
    } catch (e) {
      console.log(e)
    }
  }

  _parseHexString(str) { 
    const lookup = {
      '0': '0000',
      '1': '0001',
      '2': '0010',
      '3': '0011',
      '4': '0100',
      '5': '0101',
      '6': '0110',
      '7': '0111',
      '8': '1000',
      '9': '1001',
      'a': '1010',
      'b': '1011',
      'c': '1100',
      'd': '1101',
      'e': '1110',
      'f': '1111',
      'A': '1010',
      'B': '1011',
      'C': '1100',
      'D': '1101',
      'E': '1110',
      'F': '1111'
    };
    let ret = '';
    for (let i = 0, len = str.length; i < len; i++) {
        ret += lookup[str[i]];
    }
    return ret;

  }

  _binToJson(binary) {
    const rulesJsonArr = require('./totem-default-filter.json');
    const sep = (xs, s) => xs.length ? [xs.slice(0, s), ...sep(xs.slice(s), s)] : []
    let color;
    let type;
    for (const obj of rulesJsonArr) {
      for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
          if (key === 'name' && obj[key] === 'Shaft Color') {
            const partBin = binary.slice(obj.start, obj.start + obj.length);
            color = `rgba(${sep(partBin, 8).map(bin => parseInt(bin, 2)).join(',')})`;
          }
          if (key === 'name' && obj[key] === 'Element') {
            const idx = parseInt(binary.slice(obj.start, obj.start + obj.length), 2);
            type = obj['values'][idx - 1];
          }
        }
      }
    }
    return {
      color,
      type
    };
  }
}

module.exports = new NFT()