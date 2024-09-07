// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// import "hardhat/console.sol";

interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address, uint256) external returns (bool);   
    function transferFrom(address, address, uint256) external returns (bool);
}

contract MatchContract {

    uint256 public constant COLOR_MAX_COUNT = 10;
    uint256 public constant INDEX_MAX_COUNT = 9;
    address public constant ADMIN = 0x0d2aa26Cb57c84b3086EE605E3F9624d0afAAC8F;
    //
    event JoinRoom(uint256 indexed joinTime, address indexed user, Player player,string log, uint when);
    event BuyBox(uint256 indexed joinTime, address indexed user, Player player,uint8 index, uint when);
    event OpenBox(uint256 indexed joinTime, address indexed user, Player player,uint256 num, uint256[INDEX_MAX_COUNT] arr, uint when);
    event Withdraw(uint256 indexed joinTime, address indexed user, Player player,uint256 amount, uint when);
    event GetTestTokens(uint256 indexed joinTime, address indexed user, Player player,uint256 amount, uint when);
    //

    struct Player {
        address user;
        uint256 luck;
        uint256 surplus;
        uint256 own;
        uint256[INDEX_MAX_COUNT] cards;
        uint256 joinTime;
        string roomId;
        uint8 status;
        uint8 index;
        uint256 coin;
        uint256 testCoin;
    }

    mapping(address => Player) public playerList;

    IERC20 public immutable token;

    constructor(address _token) {
       token = IERC20(_token); 
    }

    function getPlayer() public view returns (Player memory){
        address _user = msg.sender;
        Player memory player = playerList[_user];


        // string memory str = string(abi.encodePacked(uint2str(player.joinTime), "-surplus-"
        //     , uint2str(player.surplus),"-own-",uint2str(player.own),"-luck-",uint2str(player.luck)
        //     , "-roomId-",player.roomId,"-coin-",uint2str(player.coin)));
        // console.log(
        //     "getPlayer %d => %s => %s",
        //     player.joinTime,
        //     msg.sender,
        //     str
        // );

        // printArray(player.cards);

        return player;
    }

    function getPlayerByAddr(address _user) public view returns (Player memory){
        Player memory player = playerList[_user];
        return player;
    }

    function getRoomPlayer() internal view returns (Player memory) {
        address _user = msg.sender;
        Player memory player = playerList[_user];
        if(stringsEqual(player.roomId, ""))
        {
            // creater new player or new room
            player.user = _user;
            player.luck = 0;
            player.surplus = 0;
            player.own = 0;
            player.cards = [uint256(255),255,255,255,255,255,255,255,255];
            player.joinTime = block.timestamp;
            player.roomId = generateID(_user,block.timestamp);
            player.status = 0;
            player.index = 0;
            // playerList[_user] = player;
            return player;
        }
        return player;
    }

    function buyBox(uint8 index,uint256 random) public returns (Player memory) {
        address _user = msg.sender;
        Player memory player = getRoomPlayer();
        uint256 rand = getRandomOnchain(_user,random + uint256(index));
        uint256 luck = uint256(rand % COLOR_MAX_COUNT);

        // uint256 luck = random;

        player.status = 1;
        player.luck = luck;
        player.index = index;
        

        uint256 _amount = 1;

        if(index==1){
            _amount = 1;
            player.surplus = 9;
        }else if(index==2){
            _amount = 2;
            player.surplus = 18;
        }else if(index==3){
            _amount = 3;
            player.surplus = 36;
        }


        playerList[_user] = player;

        // player consume money 
        // token.transfer(ADMIN, _amount); 
        token.transferFrom(_user, ADMIN, _amount);
         

        emit BuyBox(player.joinTime, msg.sender, player, index, block.timestamp);


        // string memory str = string(abi.encodePacked(uint2str(player.joinTime), "-surplus-"
        //     , uint2str(player.surplus),"-amount-",uint2str(_amount),"-luck-",uint2str(player.luck),"-coin-",uint2str(player.coin)));

        // console.log(
        //     "%d => %s buyBox => %s",
        //     player.joinTime,
        //     msg.sender,
        //     str
        // );
        

        return player;
    }

    function openBox(uint256[INDEX_MAX_COUNT] memory randoms) public returns (Player memory,uint256,uint256[9] memory) {
        address _user = msg.sender;
        Player memory player = playerList[_user];

        uint256 num = 0;

        // send card
        uint256[INDEX_MAX_COUNT] memory arr = [uint256(255),255,255,255,255,255,255,255,255];
        for(uint256 i = 0 ; i < INDEX_MAX_COUNT ; i++) {
            if(player.cards[i] == uint256(255)){
                num++;
            }else{
                // console.log(
                //     "%d OpenBox num => %d",
                //     i,
                //     player.cards[i]
                // );
            }
        }

        // console.log(
        //     "player.surplus => %d => %d",
        //     player.surplus,
        //     num
        // );

        if(player.surplus < num){
            num = player.surplus;
        }

        uint256 numTempRand = 0;
        for(uint256 i = 0 ; i < INDEX_MAX_COUNT ; i++) {
            uint256 rand = getRandomOnchain(_user,randoms[i] + uint256(player.luck) + uint256(player.index)) % COLOR_MAX_COUNT;
            // uint256 rand = randoms[i];
            if(player.cards[i] == uint256(255)){
                player.cards[i] = rand;
                arr[i] = rand;
                numTempRand++;
                if(numTempRand==num){
                    break;
                }
            }
        }

        // surplus box
        player.surplus = player.surplus - num;



        //own card
        uint256[COLOR_MAX_COUNT] memory colorNum = [uint256(0),0,0,0,0,0,0,0,0,0];
        for(uint256 i = 0 ; i < INDEX_MAX_COUNT ; i++){
            uint256 cardColor = player.cards[i];
            if(cardColor == 255){
            }else{
                // console.log(
                //     "cardColor => %d => %d",
                //     i,
                //     cardColor
                // );
                colorNum[cardColor]++;
            }
        }

        // check result
        for(uint256 i = 0 ; i < INDEX_MAX_COUNT ; i++){
            uint256 cardColor = player.cards[i];
            // console.log(
            //     "result => %d => %d",
            //     i,
            //     cardColor            
            // );
            if(cardColor == 255){
                continue;
            }
            uint256 colorNumber = colorNum[cardColor];

            // console.log(
            //     "check result => %d => %d => %d",
            //     i,
            //     cardColor,
            //     colorNumber
            // );

            if(colorNumber >= 3){
                // Three Links
                uint8 numTemp = 1;  
                for(uint256 j = i + 1 ; j < INDEX_MAX_COUNT ; j++){
                    uint256 cardColor2 = player.cards[j];
                    if(cardColor2 == cardColor){
                        player.cards[j] = 255;
                        numTemp++;
                    }
                    if(numTemp == 3){
                        continue;
                    }
                }
                player.cards[i] = 255;
                player.own += 3;
                player.surplus += 3;
                colorNum[cardColor] -= 3;

                // console.log(
                //     "Three Links => %d => %d -color=> %d",
                //     player.own,
                //     player.surplus,
                //     cardColor
                // );

                continue;
            }
            if(colorNumber == 2){
                // A Pair
                uint8 numTemp = 1;
                for(uint256 j = i + 1 ; j < INDEX_MAX_COUNT ; j++){
                    uint256 cardColor2 = player.cards[j];
                    if(cardColor2 == cardColor){
                        player.cards[j] = 255;
                        numTemp++;
                    }
                    if(numTemp == 2){
                        continue;
                    }
                }
                player.cards[i] = 255;
                player.own += 2;
                player.surplus += 1;
                colorNum[cardColor] -= 2;

                // console.log(
                //     "A Pair => %d => %d -color=> %d",
                //     player.own,
                //     player.surplus,
                //     cardColor
                // );

                continue;
            }
            if(cardColor == player.luck){
                // Luck
                if(player.luck == cardColor){
                    player.cards[i] = 255;
                    player.own += 1;
                    player.surplus += 1;
                    colorNum[cardColor] -= 1;
                    // console.log(
                    //     "Luck => %d => %d -color=> %d",
                    //     player.own,
                    //     player.surplus,
                    //     cardColor
                    // );

                }
                continue;
            }
        }

        // Empty pos number
        uint256 emptyPosNumber = 0;
        // check result is empty
        for(uint256 i = 0 ; i < INDEX_MAX_COUNT ; i++){
            uint256 cardColor = player.cards[i];
            if(cardColor == 255){
                emptyPosNumber ++;
            }
        }

        // console.log(
        //         "INDEX_MAX_COUNT emptyPosNumber => %d",
        //         emptyPosNumber
        //     );
        if(emptyPosNumber == INDEX_MAX_COUNT){
            player.surplus += 5;
            // console.log(
            //     "INDEX_MAX_COUNT player.surplus => %d",
            //     player.surplus
            // );
        }

        // check game is end
        if(player.surplus == 0){
            player.status = 0;
            player.roomId = "";
            player.coin += ((INDEX_MAX_COUNT - emptyPosNumber) + player.own);
            // console.log(
            //     "is end"
            // );
        }



        playerList[_user] = player;

        emit OpenBox(player.joinTime, msg.sender, player, num, arr, block.timestamp);


        // for(uint256 i = 0 ;i < player.cards.length ; i++){
        //     console.log(
        //         "%d => %s OpenBox card => %d",
        //         i,
        //         msg.sender,
        //         player.cards[i]
        //     );
        // }

        // console.log(
        //     "%d => %s OpenBox num => %d",
        //     player.joinTime,
        //     msg.sender,
        //     player.own
        // );

        // printArray(arr);

        return (player,num,arr);
    }

    function withdraw() public returns (Player memory) {
        address _user = msg.sender;
        Player memory player = getRoomPlayer();
        uint256 _amount = player.coin;
        // player get money
        token.transferFrom(ADMIN,  _user, _amount);  
        player.coin = 0;
        playerList[_user] = player;

        emit Withdraw(player.joinTime, msg.sender, player, _amount, block.timestamp);


        // console.log(
        //     "%d => %s withdraw amount => %d",
        //     player.joinTime,
        //     msg.sender,
        //     _amount
        // );

        return player;
    }

    // receive
    function getTestTokens() public returns (Player memory) {
        address _user = msg.sender;
        Player memory player = getRoomPlayer();

        if(player.coin > 0){
            emit GetTestTokens(player.joinTime, msg.sender, player, uint256(0), block.timestamp);
            return player;
        }

        uint256 _amount = 1;
        // player get money
        token.transferFrom(ADMIN,  _user, _amount);  
        player.coin += _amount;
        playerList[_user] = player;

        emit GetTestTokens(player.joinTime, msg.sender, player, _amount, block.timestamp);


        // console.log(
        //     "%d => %s receive amount => %d",
        //     player.joinTime,
        //     msg.sender,
        //     _amount
        // );

        return player;
    }



    // tool func:
    function generateID(address _user,uint256 _time) internal pure returns (string memory) {
        // address => string
        string memory addressStr = address2str(_user);

        // block.timestamp => uint256 => string
        string memory timestampStr = uint2str(_time);

        // join string
        return string(abi.encodePacked(addressStr, "-", timestampStr));
    }

    // tool func：uint256 to string
    function uint2str(uint256 _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    // tool func: address to string
    function address2str(address _addr) internal pure returns (string memory) {
        bytes memory addrBytes = abi.encodePacked(_addr);
        string memory addrStr = "0x";
        for (uint256 i = 0; i < 20; i++) {
            // 将每个字节转换为两位十六进制数
            addrStr = string(abi.encodePacked(addrStr, bytes1(uint8(addrBytes[i]) >> 4)));
            addrStr = string(abi.encodePacked(addrStr, bytes1(uint8(addrBytes[i]) & 0x0f)));
        }
        return addrStr;
    }

    // tool func:
    function stringsEqual(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }

    // tool func:
    function getRandomOnchain(address _addr,uint256 random) internal view returns(uint256) {
        bytes32 randomBytes = keccak256(abi.encodePacked(blockhash(block.number-1), msg.sender, block.timestamp, _addr, random));
        return uint256(randomBytes);
    }

    // test
   function printArray(uint256[9] memory myArray) internal pure {
        // console.log("Array:");
        // for (uint256 i = 0; i < myArray.length; i++) {
        //     console.log("Element %d: %d", i, myArray[i]);
        // }
    }

}

// v1 0x2502c7bf21b09C9e71f09dCa1B08b46C99239727
// V2 0x8621E2412a6A7392d6Ff8afE96E8bBf5Ef38A3E8
// v3 0x5306EBA81449493725Be1222922d7BA89EA75D26
// v4 0x319a764da14e6A4C29b111e41E469365bB8Ea917
// v5 0x821e91288f2f674E98e11d8E7fdFcda2daB4403C

// v6 0x390a1B5338C6bfc3fC662Ca0eE0cD72176617095
// v7 0xb4956A3437565366047E6CDe1130a2205b5c7934

// v8 0x7B8ae0E19D4f8382D0A26522c57827be2A51a546