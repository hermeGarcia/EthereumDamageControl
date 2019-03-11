pragma solidity ^0.4.17;//version de solidity para la que se ha creado el programa

interface DataBase
{
  function isClean(address add) view  public returns (bool);
  function getData(address add) view  public returns (bytes);
}


contract Server
{
      event NewAccident(
        bytes _info
      );
      event DeletedAccident(
        uint256 _deleted
      );
      event NewLost
      (
        uint256 _idAc
      );
      event FoundLost
      (
        uint256 _idAc
      );
      event NewAssistance(
        uint256 _idAc,
        address _idAssitance
      );
      event DeleteAssistance(
        uint256 _idAc,
        address _addidAssitance
      );


  struct Data
  {
    address [] A;
    uint256 [] Free;
    mapping(uint256 => bool) reg_ocup;
  }

  function size(Data storage a)view private returns(uint256)
  {
    return a.A.length - a.Free.length;
  }
  function addValue(Data storage a,address v) private returns(uint256 ind)
  {
    if(a.Free.length == 0) ind = a.A.push(v) -1;
    else
    {
      ind = a.Free[a.Free.length -1];
      a.Free.length--;
      a.A[ind] = v;
    }
    a.reg_ocup[ind] = true;
  }

  function deleteValue(Data storage a,uint256 v) private
  {
    a.reg_ocup[v] = false;
    if(v == a.A.length -1)a.A.length--;
    else
    {
      a.Free.push(v);
    }
  }


    struct CurrentPlace
    {
      uint256 accident;
      uint256 missingplace;
    }

    struct Accident
    {
      /*removing and inserting are going to be used very often so is better if it uses a implementation that takes this into account*/
      string info;
      Data missing;
      Data assistance_values;
      mapping(address => bool) assistance;
      uint256 numAssitance;
    }



    address Owner;

    /*the length of the array is not going to be long enough to be a problem, also removing and inserting are not going to be
    of often use.
      =>insert always at the end
      =>when removing from and index fill the gap with the higher index elements
    */
    Accident [] currentAccidents;
    address dataBase;
    mapping(address => bool) registerExisting;
    mapping(address => CurrentPlace) registerInfo;
    mapping(bytes => bool) registeredAccidents;

    function Server(address database) payable public
    {
      Owner = msg.sender;
      dataBase = database;
      //created for testing
      string memory message = "accidente de prueba";
      message = "incendio en hospital";
      newAccidentProtocol(message);
      message = "accidente multiple autopista";
      newAccidentProtocol(message);
      message = "derrumbamiento de un puente";
      newAccidentProtocol(message);
      message = "incendio forestal";
      newAccidentProtocol(message);
    }

    modifier OnlyOwner(address id)
    {
      require(id == Owner);
      _;
    }
    modifier noReg(address id)
    {
      require(!registerExisting[id]);
      _;
    }
    modifier existingAc(uint256 id)
    {
      require(id < currentAccidents.length);
      _;
    }
    modifier existingLost(address id)
    {
      require(registerExisting[id]);
      _;
    }

    modifier newAccident(bytes desc)
    {
      require(!registeredAccidents[desc]);
      _;
    }

    function newAccidentProtocol(string memory name) newAccident(bytes(name)) payable public returns(uint id)
    {
      Accident memory n;
      n.info = name;
      n.numAssitance = 0;
      id = currentAccidents.push(n);
      registeredAccidents[bytes(name)] = true;
      NewAccident(bytes(name));
    }
    function deleteAccidentProtocol(uint256 idAc) existingAc(idAc) private
    {
        bytes memory info = bytes(currentAccidents[idAc].info);
        registeredAccidents[info] = false;
        for(uint256 i = idAc; i < currentAccidents.length-1;i++)
        {
          currentAccidents[i] = currentAccidents[i+1];
        }
        currentAccidents.length--;
        DeletedAccident(idAc);

    }

    function getNumOfAccidents()  view public returns (uint256)
    {
        return currentAccidents.length;
    }

    function getAccident(uint256 i) view public returns (bytes)
    {
        return bytes(currentAccidents[i].info);
    }

    //Lost operations

    function newLost(uint256 idAc,address idAddress) payable noReg(idAddress) existingAc(idAc) public
    {
      registerInfo[idAddress].accident = idAc;
      registerInfo[idAddress].missingplace = addValue(currentAccidents[idAc].missing, idAddress);
      registerExisting[idAddress] = true;
      NewLost(idAc);
    }

    function foundLost(address idAddress)payable existingLost(idAddress) public
    {

      CurrentPlace storage place = registerInfo[idAddress];
      Accident storage acc = currentAccidents[place.accident];

      require(acc.assistance[msg.sender]);
      registerExisting[idAddress] = false;

      deleteValue(acc.missing,place.missingplace);
      FoundLost(place.accident);
    }

    function getLostList(uint256 idAc) view existingAc(idAc)  public returns(address[] memory)
    {
      address[] memory r = new address[](size(currentAccidents[idAc].missing));

      uint256 pos = 0;
      for(uint256 i = 0; i < currentAccidents[idAc].missing.A.length; i++)
      {
          if(currentAccidents[idAc].missing.reg_ocup[i])
          {
            r[pos] = currentAccidents[idAc].missing.A[i];
            pos++;
          }
      }
      return r;
    }

    function givesAssistance(uint256 idAc) view existingAc(idAc) public returns(bool)
    {
       return currentAccidents[idAc].assistance[msg.sender];
    }

    //assistance operations
    function addAssistance(uint256 idAc) payable existingAc(idAc)  public
    {
          require(!currentAccidents[idAc].assistance[msg.sender]);
          currentAccidents[idAc].assistance[msg.sender] = true;
          currentAccidents[idAc].numAssitance++;
          addValue(currentAccidents[idAc].assistance_values,msg.sender);
          NewAssistance(idAc,msg.sender);
    }
    function deleteAssistance(uint256 idAc) payable existingAc(idAc)  public
    {
          require(currentAccidents[idAc].assistance[msg.sender]);
          require(currentAccidents[idAc].numAssitance > 0);
          currentAccidents[idAc].assistance[msg.sender] = false;
          currentAccidents[idAc].numAssitance--;
          uint256 ind = 0;

          while(!currentAccidents[idAc].assistance_values.reg_ocup[ind])ind++;
          while(currentAccidents[idAc].assistance_values.A[ind] != msg.sender)
          {
              ind++;
              while(!currentAccidents[idAc].assistance_values.reg_ocup[ind])ind++;
          }
          deleteValue(currentAccidents[idAc].assistance_values,ind);

          DeleteAssistance(idAc,msg.sender);
          if(currentAccidents[idAc].numAssitance == 0)
            deleteAccidentProtocol(idAc);
    }

    function getAssistanceList(uint256 idAc) view existingAc(idAc)  public returns(address[] memory)
    {
      address[] memory r = new address[](size(currentAccidents[idAc].assistance_values));

      uint256 pos = 0;
      for(uint256 i = 0; i < currentAccidents[idAc].assistance_values.A.length; i++)
      {
          if(currentAccidents[idAc].assistance_values.reg_ocup[i])
          {
            r[pos] = currentAccidents[idAc].assistance_values.A[i];
            pos++;
          }
      }
      return r;
    }

    /*used in case the smartcontract is deprecated in favour of other one*/
    function kill() OnlyOwner(msg.sender) public
    {
      selfdestruct(Owner);
    }
}
