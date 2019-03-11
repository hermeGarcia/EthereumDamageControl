pragma solidity ^0.4.17;

contract DataBase
{
    mapping(address=>bytes) public dataStore;
    mapping(address => bool) public clean;
    address owner;
    bool deprecated;

    modifier OnlyOwner
    {
        require(msg.sender == owner);
        _;
    }
    function DataBase() public {
      owner = msg.sender;
      deprecated = false;
    }

//-----------------WORKING OPERATIONS---------------

    function isClean(address add) view  public returns (bool)
    {
        assert(!deprecated);
        return clean[add];
    }
    function getData(address add) view  public returns (bytes)
    {
        require(msg.gas >= 10 wei);
        require(clean[add]);
        assert(!deprecated);
        return dataStore[add];
    }
    function Deprecate() payable OnlyOwner public
    {
        require(msg.gas >= 10 wei);
        deprecated = true;
    }
    function addData(address id, bytes data) payable OnlyOwner public
    {
      require(!clean[id]);
      clean[id] = true;
      dataStore[id] = data;
    }
//-----------------DEPRECATED OPERATIONS---------------
    function kill() payable OnlyOwner public
    {
        require(msg.gas >= 100 wei);
        require(deprecated);
        selfdestruct(owner);
    }

}
