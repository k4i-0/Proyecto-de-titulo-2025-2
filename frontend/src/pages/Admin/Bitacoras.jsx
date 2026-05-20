import { useState, useEffect } from "react";

import {
  Tabs,
  notification,
  Input,
  Form,
  Button,
  DatePicker,
  Typography,
} from "antd";
import dayjs from "dayjs";

import DataTable from "../../components/Tabla";

import {
  todasBitacoras,
  traerBitacorasPorFuncionario,
} from "../../services/Auth.services";

export default function Bitacoras() {
  const { Title, Text } = Typography;
  const [bitacoras, setBitacoras] = useState([]);
  const [bitacorasOriginales, setBitacorasOriginales] = useState([]);
  const [rutFuncionario, setRutFuncionario] = useState("");
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [pestanaActiva, setPestanaActiva] = useState("bitacora_rut");
  const [form] = Form.useForm();

  const buscarTodasBitacoras = async () => {
    try {
      const response = await todasBitacoras();
      console.log("bitacoras todoas", response);
      if (response.status === 200) {
        setBitacorasOriginales(response.data);
      } else {
        notification.error({
          message: "Error al obtener las bitácoras",
          description: response.data.error || "Ocurrió un error inesperado",
        });
      }
    } catch (error) {
      console.log("Error en buscarTodasBitacoras:", error);
      notification.error({
        message: error || "Error al obtener las bitácoras",
        description: "Ocurrió un error inesperado",
      });
    }
  };

  const buscarBitacorasPorFuncionario = async () => {
    try {
      const response = await traerBitacorasPorFuncionario(rutFuncionario);
      console.log("bitacora rut", response);
      if (response.status === 200) {
        setBitacorasOriginales(response.data);
      } else {
        notification.error({
          message: "Error al obtener las bitácoras",
          description: response.data.error || "Ocurrió un error inesperado",
        });
      }
    } catch (error) {
      console.log("Error en buscarBitacorasPorFuncionario:", error);
      notification.error({
        message: error || "Error al obtener las bitácoras",
        description: "Ocurrió un error inesperado",
      });
    }
  };

  const columnas = [
    { title: "ID Bitácora", dataIndex: "idBitacora", key: "idBitacora" },
    {
      title: "Funcionario",
      dataIndex: "funcionario",
      key: "funcionario",
      render: (funcionario) => `${funcionario.nombre} ${funcionario.apellido}`,
    },
    {
      title: "Operacion",
      dataIndex: "operacion",
      key: "operacion",
    },
    {
      title: "Descripción",
      dataIndex: "descripcion",
      key: "descripcion",
    },
    {
      title: "Fecha",
      dataIndex: "fechaCreacion",
      key: "fecha",
      render: (fecha) =>
        fecha ? new Date(fecha).toLocaleDateString("es-CL") : "-",
    },
  ];

  const formatearRut = (valor) => {
    let rut = valor.replace(/[^0-9kK]/g, "");

    if (rut.length <= 1) return rut;

    const dv = rut.slice(-1);
    const cuerpo = rut.slice(0, -1);

    return `${cuerpo}-${dv}`;
  };

  const limpiarFechas = () => {
    setFechaInicio(null);
    setFechaFin(null);
  };

  const filtrosFecha = [
    {
      key: "fechaInicio",
      element: (
        <DatePicker
          value={fechaInicio ? dayjs(fechaInicio) : null}
          onChange={(date) => setFechaInicio(date)}
          placeholder="Desde"
          disabledDate={(current) =>
            current && current.isAfter(dayjs().endOf("day"))
          }
        />
      ),
    },
    {
      key: "fechaFin",
      element: (
        <DatePicker
          value={fechaFin ? dayjs(fechaFin) : null}
          onChange={(date) => setFechaFin(date)}
          placeholder="Hasta"
          disabledDate={(current) =>
            current && current.isAfter(dayjs().endOf("day"))
          }
        />
      ),
    },
  ];

  // Aplicar filtro de fechas cuando cambien
  useEffect(() => {
    if (!bitacorasOriginales || bitacorasOriginales.length === 0) {
      setBitacoras([]);
      return;
    }

    if (!fechaInicio && !fechaFin) {
      setBitacoras(bitacorasOriginales);
      return;
    }

    const datosConFiltro = bitacorasOriginales.filter((bitacora) => {
      const fecha = new Date(bitacora.fechaCreacion);
      const inicio = fechaInicio
        ? new Date(fechaInicio).setHours(0, 0, 0, 0)
        : null;
      const fin = fechaFin
        ? new Date(fechaFin).setHours(23, 59, 59, 999)
        : null;

      if (inicio && fecha.getTime() < inicio) return false;
      if (fin && fecha.getTime() > fin) return false;
      return true;
    });

    setBitacoras(datosConFiltro);
  }, [fechaInicio, fechaFin, bitacorasOriginales]);

  // Limpiar fechas al cambiar de pestaña
  useEffect(() => {
    setFechaInicio(null);
    setFechaFin(null);
  }, [pestanaActiva]);

  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginBottom: 16, padding: "4px 0" }}>
        <Title level={3} style={{ marginBottom: 4 }}>
          Bitacoras del Sistema
        </Title>
        <Text type="secondary">
          Consulta de registros operativos para seguimiento y auditoria.
        </Text>
      </div>

      <Tabs
        defaultActiveKey="bitacora_rut"
        onChange={(key) => {
          console.log("KEY", key);
          setPestanaActiva(key);
          if (key === "bitacora_todas") {
            setRutFuncionario("");
            form.resetFields();
            setBitacorasOriginales([]);
            buscarTodasBitacoras();
          }
        }}
        tabBarStyle={{ marginBottom: 20 }}
        items={[
          {
            key: "bitacora_rut",
            label: "Buscar por RUT",
            children: (
              <>
                <Form
                  layout="inline"
                  form={form}
                  style={{ marginBottom: 16, gap: 8 }}
                  onFinish={buscarBitacorasPorFuncionario}
                >
                  <Form.Item label="RUT del funcionario">
                    <Input
                      placeholder="Ingrese RUT del funcionario"
                      value={rutFuncionario}
                      onChange={(e) =>
                        setRutFuncionario(formatearRut(e.target.value))
                      }
                      maxLength={10}
                      style={{ width: 300, marginRight: 8 }}
                    />
                  </Form.Item>
                  <Button type="primary" htmlType="submit">
                    Buscar
                  </Button>
                </Form>

                <DataTable
                  data={bitacoras}
                  columns={columnas}
                  searchableFields={["idBitacora"]}
                  customFilters={filtrosFecha}
                  headerButtons={
                    <Button onClick={limpiarFechas}>Limpiar Fechas</Button>
                  }
                  showSearch={false}
                />
              </>
            ),
          },
          {
            key: "bitacora_todas",
            label: "Todas las bitácoras",
            children: (
              <DataTable
                data={bitacoras}
                columns={columnas}
                searchableFields={[
                  "funcionario.nombre",
                  "funcionario.apellido",
                  "funcionario.rut",
                ]}
                customFilters={filtrosFecha}
                headerButtons={
                  <Button onClick={limpiarFechas}>Limpiar Fechas</Button>
                }
              />
            ),
          },
        ]}
      />
    </div>
  );
}
