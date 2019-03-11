import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import web3 from './web3';
import server from './server';

class App extends Component {

  state = {
    accidentes: [],
    numAccidentes: 0,
    accidente: -1,
    lost: [],
    value: 0,
    message: ''
  };

  async componentDidMount(){

    const l = await server.methods.getNumOfAccidents().call();
    console.log(l);
    var accidentes = [];
    var i;
    for(i = 0; i < l;i++)
    {
        var aux =  await server.methods.getAccident(i).call();
        accidentes.push(web3.utils.toAscii(aux));
    }

    server.events.NewAccident( (error,result) => {
        if(!error)
        {
          this.refreshAccidents(result);
        }
    });

    server.events.DeletedAccident( (error,result) => {
        if(!error)
        {
            this.refreshAccidents(result);
        }
    });
    server.events.NewLost((error,result) => {
        const parsed = parseInt(result.returnValues._idAc,10);
        if(!error && (parsed === this.state.accidente))
        {
           this.refreshLost(result);
        }
    });
    server.events.FoundLost( (error,result) => {
      const parsed = parseInt(result.returnValues._idAc,10);
      if(!error && (parsed === this.state.accidente))
      {
         this.refreshLost(result);
      }
    });

    this.setState({accidentes: accidentes, numAccidentes: l});
  }

  refreshLost = async(result) =>
  {
    const parsed = parseInt(result.returnValues._idAc,10);
    const lost = await server.methods.getLostList(parsed).call();
    this.setState({lost: lost});
    if(lost.length > 0){
      var ret = this.createLostList();
    }
    this.setState({lost: ret});

  }

  refreshAccidents = async(result) =>
  {
    const l = await server.methods.getNumOfAccidents().call();
    var accidentes = [];
    var i;
    for(i = 0; i < l;i++)
    {
        var aux =  await server.methods.getAccident(i).call();
        accidentes.push(web3.utils.toAscii(aux));
    }
    this.setState({accidentes: accidentes, numAccidentes: l});
  }

  onSubmit = async (event) => {
    event.preventDefault();

    const parsedvalue = parseInt(event.target.value,10);
    var ret = [];
    if(parsedvalue === 0){
      ret.push(<p key={0} value={0}></p>);
    }
    else{
      const lost = await server.methods.getLostList(parsedvalue-1).call();
      this.setState({lost: lost});
      if(lost.length > 0)
      {
        ret = this.createLostList();
      }
      else
      {
        ret.push(<p key={0} value={0}>no hay desaparecidos para este accidente</p>);
      }
    }
    this.setState({accidente: parsedvalue -1,lost: ret});

  };

  addedMising = async(event) => {
      event.preventDefault();
      const address = this.state.value;
      this.state.value = 0;
      if(web3.utils.isAddress(address) && (this.state.accidente >= 0))
      {
        const accounts = await web3.eth.getAccounts();
        this.setState({message: "conectando"});
        await server.methods.newLost(this.state.accidente,address).send({
          from: accounts[0]
        });
        this.setState({message: "transaccion completada, desaparecido registrado"});

      }
      else
      {
        this.setState({message: "debe ser una direccion valida y tener seleccionado un accidente"});
      }
  }

  createLostList = function()
  {
    var ret = [];
    var i;
    ret.push(<p key={0} value={0}>Lista de desaparecidos: </p>);
    for(i = 0; i < this.state.lost.length; i++)
    {
      ret.push(<p key={i+1} value={i}>{this.state.lost[i]}</p>);
    }
    return ret;
  }

  createAccidents = function()
  {
      var ret = [];
      var i = 0;
      ret.push(<option key={i} value={i}>--seleccionar--</option>);
      for(i = 1; i <= this.state.numAccidentes; i++)
      {
        ret.push(<option key={i} value={i}>{this.state.accidentes[i-1]}</option>);
      }
      return ret;
  }

  //createMissingList = funtion

  render() {
    return (
      <div>
      <h2>Accidentes por solventar</h2>
      <p>
        Aquí entontrara la lista de los accidentes que aún no se han solucionado.
        Si se encuentra en alguno, por favor indiquelo y se procedera a intentar rescatarle.
      </p>
      <hr/>
      <h4>seleccione un accidente para ver su lista de desaparecidos</h4>
      <select onChange = {this.onSubmit}>
        {this.createAccidents()}
      </select>
      <hr/>
      {this.state.lost}
      <hr/>
      <form onSubmit = {this.addedMising}>
            <h4>si tiene el identificador de un desaparecido en este accidente, introduzcalo</h4>
            <div>
              <label>identificador </label>
              <input
                  value = {this.state.value}
                  onChange = {event => this.setState({value: event.target.value})}
              />
              </div>
              <button> incluir </button>
        </form>
        <hr/>
        <p>{this.state.message}</p>
        </div>
  );
  }
}

export default App;
