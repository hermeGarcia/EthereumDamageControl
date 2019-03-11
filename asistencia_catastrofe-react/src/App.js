import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import web3 from './web3';
import server from './server';

class App extends Component {

  state = {
    numOfAccidents: 0,
    listOfAccidents: new Map(),

    listOfNonSubscribed: [],
    listOfSubscribed: [],

    nonSubscribedOptions: [],
    nonsubscribedAccidentSelected: "",
    nonSubscribedOptionSelected: "",
    nonSubscribedInformationSelected: [],

    subscribedChoices: [],
    subscribedAccidentSelected: "",
    subscribedOptionSelected: "",
    subscribedInformationSelected: [],

    found: 0,
    newAccidentAlert: "",
    message: ''
  };

  async componentDidMount(){

    const accounts = await web3.eth.getAccounts();
    const l = await server.methods.getNumOfAccidents().call();
    console.log(l);
    var listOfAccidents = new Map();
    var listOfNonSubscribed = [];
    var listOfSubscribed = [];
    var i;
    listOfNonSubscribed.push(<option key={0} value={"--seleccionar--"}>--seleccionar--</option>);
    listOfSubscribed.push(<option key={0} value={"--seleccionar--"}>--seleccionar--</option>);
    for(i = 0; i < l;i++)
    {

        var aux =  await server.methods.getAccident(i).call();
        aux = web3.utils.toAscii(aux)
        const lost = await server.methods.getLostList(i).call();
        const assistance = await server.methods.getAssistanceList(i).call();
        var value = new Object();
        value.lost = lost;
        value.index = i;
        value.assistance = assistance;
        listOfAccidents = listOfAccidents.set(aux,value);

        var reg = await server.methods.givesAssistance(i).call({from: accounts[0]});
        if(reg)
        {

          listOfSubscribed.push(<option key={i+1} value={aux}>{aux}</option>);
        }
        else
          listOfNonSubscribed.push(<option key={i+1} value={aux}>{aux}</option>);
    }
    server.events.allEvents( (error,result) => {
      if(!error)
      {
         this.refreshSate(result);
      }
    });

    this.setState({
      listOfAccidents: listOfAccidents,
      numOfAccidents: l,
      listOfSubscribed: listOfSubscribed,
      listOfNonSubscribed: listOfNonSubscribed
    });
  }

  refreshLost = async(result) =>
  {
    const parsed = parseInt(result.returnValues._idAc,10);
    var info  = await server.methods.getAccident(parsed).call();
    const lost = await server.methods.getLostList(parsed).call();
    info = web3.utils.toAscii(info);
    this.setState({listOfAccidents: this.state.listOfAccidents.set(info,lost)});
  }
  refreshSate = async(result) =>
  {
    this.setState({message: "actualizando datos"});
    const accounts = await web3.eth.getAccounts();
    const l = await server.methods.getNumOfAccidents().call();
    console.log(l);
    var listOfAccidents = new Map();
    var listOfNonSubscribed = [];
    var listOfSubscribed = [];
    var i;
    listOfNonSubscribed.push(<option key={0} value={"--seleccionar--"}>--seleccionar--</option>);
    listOfSubscribed.push(<option key={0} value={"--seleccionar--"}>--seleccionar--</option>);
    for(i = 0; i < l;i++)
    {
        var aux =  await server.methods.getAccident(i).call();
        aux = web3.utils.toAscii(aux)
        const lost = await server.methods.getLostList(i).call();
        const assistance = await server.methods.getAssistanceList(i).call();
        var value = new Object();
        value.lost = lost;
        value.index = i;
        value.assistance = assistance;
        listOfAccidents = listOfAccidents.set(aux,value);

        var reg = await server.methods.givesAssistance(i).call({from: accounts[0]});
        if(reg)
        {

          listOfSubscribed.push(<option key={i+1} value={aux}>{aux}</option>);
        }
        else
          listOfNonSubscribed.push(<option key={i+1} value={aux}>{aux}</option>);
    }


    var nonSubscribedOptionSelected = this.state.nonSubscribedOptionSelected;
    var ret = [];
    var subscribedOptionSelected = this.state.subscribedOptionSelected;
    var ret_subs = [];
    if(this.state.nonsubscribedAccidentSelected !== "")
    {
      if(nonSubscribedOptionSelected === "Ver asistencia"){
        ret.push(<p key={"cabecera"} value={0}>Asistencia actual</p>);
        ret = ret.concat(this.createList(listOfAccidents.get(this.state.nonsubscribedAccidentSelected).assistance));

      }
      else if(nonSubscribedOptionSelected === "Ver desaparecidos"){
        ret.push(<p key={"cabecera"} value={0}>Actualmente desaparecidos en este accidente</p>);
        ret = ret.concat(this.createList(listOfAccidents.get(this.state.nonsubscribedAccidentSelected).lost));
      }
    }
    else
      this.setState({nonSubscribedOptions: []});

    if(this.state.subscribedAccidentSelected !== "")
    {
        if(subscribedOptionSelected === "Ver asistencia"){
          ret_subs.push(<p key={"cabecera"} value={0}>Asistencia actual</p>);
          ret_subs = ret_subs.concat(this.createList(listOfAccidents.get(this.state.subscribedAccidentSelected).assistance));

        }
        else if(subscribedOptionSelected === "Ver desaparecidos"){
          ret_subs.push(<p key={"cabecera"} value={0}>Actualmente desaparecidos en este accidente</p>);
          ret_subs = ret_subs.concat(this.createList(listOfAccidents.get(this.state.subscribedAccidentSelected).lost));
        }
    }
    else
       this.setState({subscribedChoices: []});


    this.setState({
      listOfAccidents: listOfAccidents,
      numOfAccidents: l,
      listOfSubscribed: listOfSubscribed,
      listOfNonSubscribed: listOfNonSubscribed,
      nonSubscribedInformationSelected: ret,
      subscribedInformationSelected: ret_subs,
      message: "datos actualizados"
    });
  }

  createList = function(lost)
  {
    var ret = [];
    var i;
    if(lost.length === 0)ret.push(<p key={0} value={0}>Lista vacia </p>);
    else{
       for(i = 0; i < lost.length; i++)
       {
         ret.push(<p key={i+1} value={i}>{lost[i]}</p>);
       }
    }
    return ret;
  }

  loadInfoAccident = function(option,accident){
    var ret = [];
    if(option === "Ver asistencia"){
      ret.push(<p key={"cabecera"} value={0}>Asistencia actual</p>);
      ret = ret.concat(this.createList(this.state.listOfAccidents.get(accident).assistance));

    }
    else if(option === "Ver desaparecidos"){
      ret.push(<p key={"cabecera"} value={0}>Actualmente desaparecidos en este accidente</p>);
      ret = ret.concat(this.createList(this.state.listOfAccidents.get(accident).lost));
    }
    return ret;
  }
  watchNonSubscrivedInfo = async(event) => {
      event.preventDefault();
      var nonSubscribedOptionSelected = event.target.value;
      var ret = this.loadInfoAccident(nonSubscribedOptionSelected,this.state.nonsubscribedAccidentSelected);

      if(event.target.value !== "Ver asistencia" && event.target.value !== "Ver desaparecidos")
              nonSubscribedOptionSelected = ""

      this.setState({nonSubscribedInformationSelected: ret,nonSubscribedOptionSelected: nonSubscribedOptionSelected});
  }

  watchSubscrivedInfo = async(event) => {
      event.preventDefault();
      var subscribedOptionSelected = event.target.value;
      var ret = this.loadInfoAccident(subscribedOptionSelected,this.state.subscribedAccidentSelected);

      if(event.target.value !== "Ver asistencia" && event.target.value !== "Ver desaparecidos")
              subscribedOptionSelected = ""

      this.setState({subscribedInformationSelected: ret,subscribedOptionSelected: subscribedOptionSelected});
  }


  selectedChoices = function(sel,opt,acc,label){
       var ret = [];
       if(sel !== "--seleccionar--")
       {
         ret.push(
            <select key={3} onChange = {opt}>
            <option key={0} value={"--Que desea ver--"}>--Que desea ver--</option>
            <option key={1} value={"Ver asistencia"}>Ver asistencia</option>
            <option key={2} value={"Ver desaparecidos"}>Ver desaparecidos</option>
            </select>
         );
        ret.push(
          <button key={4} onClick = {acc}>{label}</button>
        );
      }
      return ret;
  }

  nonSubscribedSelected = async(event) => {
    event.preventDefault();
    var ret = this.selectedChoices(event.target.value,this.watchNonSubscrivedInfo,this.subscribe,"subscribirme");
    var p = "";
    var data = [];
    if(event.target.value !== "--seleccionar--" ){
      p = event.target.value;
      var opt = this.state.nonSubscribedOptionSelected;
      if(opt !=="")
          data = this.loadInfoAccident(opt,event.target.value);

    }
    this.setState({
      nonsubscribedAccidentSelected: p,
      nonSubscribedOptions: ret,
      nonSubscribedInformationSelected: data,
      nonSubscribedOptionSelected: opt
    });
  }


  subscribedSelected = async(event) => {
    event.preventDefault();
    var ret =  this.selectedChoices(event.target.value,this.watchSubscrivedInfo,this.subscribe,"anular subscripcion");
    var p = "";
    var data = [];
    if(event.target.value !== "--seleccionar--" ){
      p = event.target.value;
      var opt = this.state.subscribedOptionSelected;
      if(opt !=="")
          data = this.loadInfoAccident(opt,event.target.value);
    }
    this.setState({
      subscribedAccidentSelected: p,
      subscribedChoices: ret,
      subscribedInformationSelected: data,
      subscribedOptionSelected: opt
    });
  }

  subscribe = async(event) => {
      const accounts = await web3.eth.getAccounts();
      var info = this.state.nonsubscribedAccidentSelected;
      console.log(info);
      var index = this.state.listOfAccidents.get(info).index;
      console.log(index);
      this.setState({message: "conectando",nonsubscribedAccidentSelected: ""});
      await server.methods.addAssistance(index).send({from: accounts[0]});
      this.setState({message: "en breves se actualizaran sus listas"});

  }
  cancel_subscription = async(event) => {
      const accounts = await web3.eth.getAccounts();
      var info = this.state.subscribedAccidentSelected;
      console.log(info);
      var index = this.state.listOfAccidents.get(info).index;
      console.log(index);
      this.setState({message: "conectando",subscribedAccidentSelected: ""});
      await server.methods.deleteAssistance(index).send({from: accounts[0]});
      this.setState({message: "en breves se actualizaran sus listas"});

  }

  foundLost = async(event) => {
    event.preventDefault();
    const address = this.state.found;
    this.state.found = 0;
    if(web3.utils.isAddress(address))
    {
      const accounts = await web3.eth.getAccounts();
      this.setState({message: "conectando"});
      await server.methods.foundLost(address).send({
        from: accounts[0]
      });
      this.setState({message: "transaccion completada, cambio registrado"});

    }
    else
    {
      this.setState({message: "debe ser una direccion valida"});
    }
  }
  alertNewAccident = async(event) => {
    event.preventDefault();
    const info = this.state.newAccidentAlert;
    this.state.newAccidentAlert = "";

    const accounts = await web3.eth.getAccounts();
    this.setState({message: "conectando"});
    await server.methods.newAccidentProtocol(info).send({
        from: accounts[0]
    });
    this.setState({message: "transaccion completada, cambio registrado"});

  }

  destruyeDePrueba = async(event) => {
    const accounts = await web3.eth.getAccounts();
    await server.methods.kill().send({from: accounts[0]});
    console.log("destruido");
  }

  //createMissingList = funtion

  render() {
    return (
      <div>
      <h2>Accidentes a los que no estoy subscrito</h2>
      <select onChange = {this.nonSubscribedSelected}>
        {this.state.listOfNonSubscribed}
      </select>
      {this.state.nonSubscribedOptions}
      <hr/>
      {this.state.nonSubscribedInformationSelected}
      <hr/>
      <h2>Accidentes a los que estoy subscrito</h2>
      <select onChange = {this.subscribedSelected}>
        {this.state.listOfSubscribed}
      </select>
      {this.state.subscribedChoices}
      <hr/>
      {this.state.subscribedInformationSelected}
      <hr/>
      <form onSubmit = {this.foundLost}>
          <label>Persona encontrada: </label>
          <input
              value = {this.state.found}
              onChange = {event => this.setState({found: event.target.value})}
          />
          <button> aparecio </button>
      </form>
      <form onSubmit = {this.alertNewAccident}>
          <label>nuevo accidente: </label>
          <input
              value = {this.state.newAccidentAlert}
              onChange = {event => this.setState({newAccidentAlert: event.target.value})}
          />
          <button> alertar </button>
      </form>
      <hr/>
      <button onClick = {this.destruyeDePrueba}>CLICK</button>
      <p>{this.state.message}</p>
      </div>
  );
  }
}

export default App;
