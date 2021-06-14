//import './App.css';
import React, { useState, useEffect } from "react";
import axios from 'axios';
import BACK_URL from './../Variaveis';

import "c3/c3.min.css";

import {
  Page,
  Icon,
  Grid,
  Card,
  Table,
  colors,
  Button,
  StatsCard,
  Form,
  StoreCard,
  Badge,
  Alert,
  Header,
} from "tabler-react";

import C3Chart from "react-c3js";
import SiteWrapper from "../Layouts/SiteWrapper.react";
import { delay } from "q";

function Dashboard() {

  const [temperatures, setTemperatures] = useState(["data1", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"]);
  const [humiditys, setHumiditys] = useState(["data1", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"]);
  const [hourly, setHourly] = useState([{}]);
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [temperature, setTemperature] = useState(30);
  const [humidity, setHumidity] = useState(60);
  const [srcCamera, setSrcCamera] = useState("http://192.168.1.50/sysmartplant/mjpeg?loginuse=admin&amp;loginpas=");
  const [colorBtnFlash, setColorBtnFlash] = useState("secondary");
  const [temperatureAnt, setTemperatureAnt] = useState(30);
  const [humidityAnt, setHumidityAnt] = useState(60);

  const getTemperature = async () => {
    try {
      const res = await axios.get(BACK_URL() + '/sysmartplant/v1/temperature/last');
      if (res.data.data.value != temperature && temperature != 0) {
        setTemperatureAnt(temperature);
      }
      setTemperature(res.data.data.value);
      console.log(res.data.data.value);

    } catch (err) {
      console.error(err.message);
    }
  };

  const getHumidity = async () => {
    try {
      const res = await axios.get(BACK_URL() + '/sysmartplant/v1/humidity/last');
      if (res.data.data.value != humidity && humidity != 0) {
        setHumidityAnt(humidity);
      }
      setHumidity(res.data.data.value);
      console.log(res.data.data.value);

    } catch (err) {
      console.error(err.message);
    }
  };

  const getTemperature24h = async () => {
    try {
      const res = await axios.get(BACK_URL() + '/sysmartplant/v1/temperature/last24hrs');
      const temp = res.data.data;
      console.log(temp);
      setTemperatures(oldArray => [oldArray[0], temp[23].value, temp[22].value, temp[21].value, temp[20].value, temp[19].value, temp[18].value, temp[17].value, temp[16].value, temp[15].value, temp[14].value, temp[13].value, temp[12].value, temp[11].value, temp[10].value, temp[9].value, temp[8].value, temp[7].value, temp[6].value, temp[5].value, temp[4].value, temp[3].value, temp[2].value, temp[1].value, temp[0].value]);


    } catch (err) {
      console.error(err.message);
    }
  };

  const getHumidity24h = async () => {
    try {
      const res = await axios.get(BACK_URL() + '/sysmartplant/v1/humidity/last24hrs');
      const temp = res.data.data;
      console.log(temp);
      setHumiditys(oldArray => [oldArray[0], temp[23].value, temp[22].value, temp[21].value, temp[20].value, temp[19].value, temp[18].value, temp[17].value, temp[16].value, temp[15].value, temp[14].value, temp[13].value, temp[12].value, temp[11].value, temp[10].value, temp[9].value, temp[8].value, temp[7].value, temp[6].value, temp[5].value, temp[4].value, temp[3].value, temp[2].value, temp[1].value, temp[0].value]);

    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {

    getTemperature();
    getHumidity();
    const interval = setInterval(() => {
      getTemperature()
      getHumidity()
    }, 1000)


    return () => clearInterval(interval)
  }, [])

  useEffect(() => {

    getTemperature24h();
    getHumidity24h();
    const interval1 = setInterval(() => {
      getTemperature24h()
      getHumidity24h()
    }, 60000)


    return () => clearInterval(interval1)
  }, [])


  useEffect(() => {
    axios.get(BACK_URL() + '/sysmartplant/v1/hourly/')
      .then(res => {
        setHourly(res.data.data);
        axios.post('http://localhost:4000/hourly/', res.data, {});
      })
      .catch(function (error) {
        console.log(error);
      });

  }, [refresh])

  const deleteHourly = (id) => {
    console.log("==========> " + BACK_URL() + '/sysmartplant/v1/hourly/' + id);
    axios.delete(BACK_URL() + '/sysmartplant/v1/hourly/' + id, {
    })
      .then(() => {
        setRefresh(Math.random())
      }
      )
      .catch(err => console.log(err));
  }

  const handleSubmit = () => {

    if (inicio == "" || fim == "") {
      alert("Hora inválida");
      return 0;
    }

    if (inicio.indexOf("_") != -1 || fim.indexOf("_") != -1) {
      alert("Hora inválida");
      return 0;
    }

    var inicioSeg = inicio.split(":");
    var fimSeg = fim.split(":");

    if ((parseInt(inicioSeg[0])) > 23 || (parseInt(fimSeg[0]) > 23)) {
      alert("Hora inválida");
      return 0;
    }

    if ((parseInt(inicioSeg[1])) > 59 || (parseInt(fimSeg[1]) > 59) || (parseInt(inicioSeg[2])) > 59 || (parseInt(fimSeg[2]) > 59)) {
      alert("Hora inválida");
      return 0;
    }

    inicioSeg = (parseInt(inicioSeg[0]) * 3600) + (parseInt(inicioSeg[1]) * 60) + parseInt(inicioSeg[2]);
    fimSeg = (parseInt(fimSeg[0]) * 3600) + (parseInt(fimSeg[1]) * 60) + parseInt(fimSeg[2]);

    const obj = {
      id: 0,
      start: inicioSeg,
      end: fimSeg
    }
    axios.post(BACK_URL() + '/sysmartplant/v1/hourly/', obj, {
    })
      .then(() => {
        setRefresh(Math.random())
        setInicio("")
        setFim("")
      }
      );
  }

  const activeFlash = () => {
    if (colorBtnFlash == "success") {
      setColorBtnFlash("secondary");
      axios.post('http://localhost:4000/flash/', { flash: "flashOff" }, {});
    } else {
      setColorBtnFlash("success");
      axios.post('http://localhost:4000/flash/', { flash: "flashOn" }, {});
    }
  }

  const handleAlert1 = () => {

    if (humidity > 75) {
      return (
        <Alert type="danger" icon="alert-triangle" isDismissible>
          <b>Umidade acima de 75%.</b> Riscos de morfo.
      </Alert>
      )
    }

  }

  const handleAlert2 = () => {

    if (humidity < 15) {
      return (
        <Alert type="warning" icon="alert-triangle" isDismissible>
          <b>Umidade abaixo de 15%.</b> As raizes podem secar, regue sua planta.
      </Alert>
      )
    }

  }

  const handleAlert3 = () => {

    if (temperature > 37) {
      return (
        <Alert type="danger" icon="alert-triangle" isDismissible>
          <b>Temperatura acima de 37°C.</b> Temperatura muito elevada, sua planta pode morrer.
      </Alert>
      )
    }

  }

  const handleAlert4 = () => {

    if (temperature < 14) {
      return (
        <Alert type="warning" icon="alert-triangle" isDismissible>
          <b>Temperatura abaixo de 14°C.</b> Aumente a temperatura ou sua planta diminuirá o metabolismo.
      </Alert>
      )
    }

  }

  return (
    <SiteWrapper>
      <Page.Content>
        {handleAlert1()}
        {handleAlert2()}
        {handleAlert3()}
        {handleAlert4()}
        <Grid.Row>
          <Grid.Col md={6} >
            <Card>
              <Card.Header>
                <Card.Title>Adicionar ao Cronograma</Card.Title>
                <Card.Options>
                  <Button RootComponent="a" color="secondary" size="sm" onClick={handleSubmit}>
                    <Icon name="plus" />
                  </Button>
                </Card.Options>
              </Card.Header>
              <Card.Body>
                <Card.Options>
                  <Grid.Col>
                    <Form.Group label="Início">
                      <Form.MaskedInput
                        placeholder="00:00:00"
                        mask={[/\d/, /\d/, ":", /\d/, /\d/, ":", /\d/, /\d/]}
                        onChange={(e) => setInicio(e.target.value)}
                        value={inicio}
                      />
                    </Form.Group>
                  </Grid.Col>
                  <Grid.Col>
                    <Form.Group label="Término">
                      <Form.MaskedInput
                        placeholder="00:00:00"
                        mask={[/\d/, /\d/, ":", /\d/, /\d/, ":", /\d/, /\d/]}
                        onChange={(e) => setFim(e.target.value)}
                        value={fim}
                      />
                    </Form.Group>
                  </Grid.Col>
                </Card.Options>
              </Card.Body>
            </Card>
            <Card>
              <Card.Header>
                <Card.Title>Cronograma de Rega</Card.Title>
              </Card.Header>
              <Table
                cards={true}
                striped={true}
                responsive={true}
                className="table-vcenter"
              >
                <Table.Header>
                  <Table.Row>
                    <Table.ColHeader>Início</Table.ColHeader>
                    <Table.ColHeader>Término</Table.ColHeader>
                    <Table.ColHeader />
                  </Table.Row>
                </Table.Header>
                <Table.Body>

                  {

                    hourly.map((element) => {
                      var hoursS = Math.floor(element.start / 3600) < 10 ? ("00" + Math.floor(element.start / 3600)).slice(-2) : Math.floor(element.start / 3600);
                      var minutesS = ("00" + Math.floor((element.start % 3600) / 60)).slice(-2);
                      var secondsS = ("00" + (element.start % 3600) % 60).slice(-2);
                      var hoursE = Math.floor(element.end / 3600) < 10 ? ("00" + Math.floor(element.end / 3600)).slice(-2) : Math.floor(element.end / 3600);
                      var minutesE = ("00" + Math.floor((element.end % 3600) / 60)).slice(-2);
                      var secondsE = ("00" + (element.end % 3600) % 60).slice(-2);
                      return (
                        <Table.Row>
                          <Table.Col><Icon name="clock" /> {hoursS}:{minutesS}:{secondsS}</Table.Col>
                          <Table.Col className="text-nowrap"><Icon name="clock" /> {hoursE}:{minutesE}:{secondsE}</Table.Col>
                          <Table.Col className="w-1">
                            <Card.Options>
                              <Button RootComponent="a" color="secondary" size="sm" onClick={() => deleteHourly(element.id)}>
                                <Icon name="trash" />
                              </Button>
                            </Card.Options>
                          </Table.Col>
                        </Table.Row>
                      )
                    })
                  }
                </Table.Body>
              </Table>
            </Card>
          </Grid.Col>
          <Grid.Col md={6} >
            <Grid.Row>
              <Grid.Col sm={6} lg={6}>
                <StatsCard
                  layout={2}
                  movement={(((parseFloat(temperature) - parseFloat(temperatureAnt)) / parseFloat(temperatureAnt)) * 100).toFixed(0)}
                  total={parseFloat(temperature).toFixed(2) + "°C"}
                  label="Temperatura"
                  chart={
                    <C3Chart
                      style={{ height: "100%" }}
                      padding={{
                        bottom: -10,
                        left: -1,
                        right: -1,
                      }}
                      data={{
                        names: {
                          data1: "Temperatura",
                        },
                        columns: [temperatures],
                        type: "area",
                      }}
                      legend={{
                        show: false,
                      }}
                      transition={{
                        duration: 0,
                      }}
                      point={{
                        show: false,
                      }}
                      tooltip={{
                        format: {
                          title: function (x) {
                            return "";
                          },
                        },
                      }}
                      axis={{
                        y: {
                          padding: {
                            bottom: 0,
                          },
                          show: false,
                          tick: {
                            outer: false,
                          },
                        },
                        x: {
                          padding: {
                            left: 0,
                            right: 0,
                          },
                          show: false,
                        },
                      }}
                      color={{
                        pattern: ["#e74c3c"],
                      }}
                    />
                  }
                />
              </Grid.Col>
              <Grid.Col sm={6} lg={6}>
                <StatsCard
                  layout={2}
                  movement={(((parseFloat(humidity) - parseFloat(humidityAnt)) / parseFloat(humidityAnt)) * 100).toFixed(0)}
                  total={parseFloat(humidity).toFixed(2) + "%"}
                  label="Umidade"
                  chart={
                    <C3Chart
                      style={{ height: "100%" }}
                      padding={{
                        bottom: -10,
                        left: -1,
                        right: -1,
                      }}
                      data={{
                        names: {
                          data1: "Umidade",
                        },
                        columns: [humiditys],
                        type: "area",
                      }}
                      legend={{
                        show: false,
                      }}
                      transition={{
                        duration: 0,
                      }}
                      point={{
                        show: false,
                      }}
                      tooltip={{
                        format: {
                          title: function (x) {
                            return "";
                          },
                        },
                      }}
                      axis={{
                        y: {
                          padding: {
                            bottom: 0,
                          },
                          show: false,
                          tick: {
                            outer: false,
                          },
                        },
                        x: {
                          padding: {
                            left: 0,
                            right: 0,
                          },
                          show: false,
                        },
                      }}
                      color={{
                        pattern: ["#467fcf"],
                      }}
                    />
                  }
                />
              </Grid.Col>
            </Grid.Row>
            <Grid.Row>
              <Grid.Col md={12}>
                <Grid.Row>
                  <Grid.Col sm={12}>
                    <Card>
                      <Card.Header>
                        <Card.Title>Camera</Card.Title>
                        <Card.Options>
                          <Button color={colorBtnFlash} size="sm" onClick={activeFlash}>
                            <Icon name="eye" />
                          </Button>
                        </Card.Options>
                      </Card.Header>
                      <Card.Body>
                        <img name="main" id="main" onError={() => setSrcCamera("./img/notImage.jpg")} border="0" width="527" height="400" src={srcCamera} />
                      </Card.Body>
                    </Card>
                  </Grid.Col>
                </Grid.Row>
              </Grid.Col>
            </Grid.Row>
          </Grid.Col>
        </Grid.Row>
      </Page.Content>
    </SiteWrapper>

  );
}

export default Dashboard;
