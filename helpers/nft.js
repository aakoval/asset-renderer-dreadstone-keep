'use strict'
const Web3 = require('web3');

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

      const tokenURI = await contract.methods.tokenURI(id).call()
      

      const result = this._parseHexString(tokenURI)
      let rJson = {};
      if (type === 'item') {
        rJson = this._binItemToJson(result);
      }

      if (type === 'avatar') {
        rJson = this._binAvatarToJson(result);
      }

      

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
      if (lookup[str[i]]) {
        ret += ((ret.length === 0 && lookup[str[i]] === '0000') ? '' : lookup[str[i]]);
      }
    }
    return ret;

  }

  _binItemToJson(binary) {
    const rulesJsonArr = require('./totem-filter.json');
    const sep = (xs, s) => xs.length ? [xs.slice(0, s), ...sep(xs.slice(s), s)] : []
    let color;
    let type;
    let typeColors;
    for (const obj of rulesJsonArr) {
      for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
          if (key === 'id' && obj[key] === 'primary_color') {
            const partBin = binary.slice(obj.gene * 32 + obj.start, obj.gene * 32 + obj.start + obj.length);
            color = partBin.includes('undefined') ? '#FFD011' : `rgb(${sep(partBin, 8).map(bin => parseInt(bin, 2)).join(',')})`;
          }
          if (key === 'id' && obj[key] === 'classical_element') {
            const idx = parseInt(binary.slice(obj.gene * 32 + obj.start, obj.gene * 32 + obj.start + obj.length), 2);
            type = obj.values[idx]?.key;
          }
        }
      }
    }

    switch (type) {
      case 'Air':
        typeColors = ['#84DFF3', '#B5F9E8', '#51A490'];
        break;
      case 'Earth':
        typeColors = ['#9FFC2A', '#36ED7F', '#418E1D'];
        break;
      case 'Fire':
        typeColors = ['#FC2A50', '#ED3636', '#9C1818'];
        break;
      case 'Water':
        typeColors = ['#2A97FC', '#73A3D0', '#184D9C'];
        break;
      default:
        typeColors = ['#9FFC2A', '#36ED7F', '#418E1D'];
        break;
    }
    return {
      color,
      typeColors
    };
  }

  _binAvatarToJson(binary) {
    const rulesJsonArr = require('./avatar-filter.json');
    const sep = (xs, s) => xs.length ? [xs.slice(0, s), ...sep(xs.slice(s), s)] : []
    let avatarSetting = {
      sex_bio: 1,
      body_strength: 1,
      body_type: 1,
      human_skin_color: '#f9d4ab',
      human_skin_color_darken: '#f9d4ab',
      human_hair_color: '#b1b1b1',
      human_hair_color_lighten: '#b1b1b1',
      human_eye_color: '#b5d6e0',
      hair_styles: 'afro',
      primary_color: 'rgba(65,184,206,128)'
    }
    for (const obj of rulesJsonArr) {
      for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
          if (key === 'id' && obj[key] === 'primary_color') {
            const partBin = binary.slice(obj.gene * 32 + obj.start, obj.gene * 32 + obj.start + obj.length);
            avatarSetting.primary_color = partBin.includes('undefined') ? '#FFD011' : `rgb(${sep(partBin, 8).map(bin => parseInt(bin, 2)).join(',')})`;
          }
          if (key === 'id' && obj.type === 'bool') {
            const partBin = binary.slice(obj.gene * 32 + obj.start, obj.gene * 32 + obj.start + obj.length);
            avatarSetting[obj.id] = parseInt(partBin, 2);
          }
          if (key === 'id' && obj.type === 'map') {
            const idx = parseInt(binary.slice(obj.gene * 32 + obj.start, obj.gene * 32 + obj.start + obj.length), 2);
            avatarSetting[obj.id] = obj.values[idx]?.key || avatarSetting[obj.id];
          }
        }
      }
    }
    avatarSetting.human_skin_color_darken = this.adjust(avatarSetting.human_skin_color, -20);
    avatarSetting.human_hair_color_lighten = this.adjust(avatarSetting.human_hair_color, 150);
    
    return avatarSetting;
  }

  adjust(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
  }
}

module.exports = new NFT()