import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Button,
  Alert,
  Typography,
  Table,
  Space,
  Popconfirm,
  Empty,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

import { useNavigate } from "react-router-dom";

import CrearSucursal from "../components/inventario/modalSucursal/CrearSucursal";
import EditarSucursal from "../components/inventario/modalSucursal/EditarSucursal";

import obtenerSucursales, {
  eliminarSucursal,
} from "../services/inventario/Sucursal.service";

//import VerBodegas from "../components/inventario/modalBodega/verBodegas";

export default function Sucursal() {
  const navigate = useNavigate();
  const { Title } = Typography;
  const [sucursales, setSucursales] = useState([]);
  const [error, setError] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const [sucursalSelect, setSucursalSelect] = useState(null);
  //const [bodegaSelect, setBodegaSelect] = useState(null);

  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  //const [modalBodegaVer, setModalBodegaVer] = useState(false);

  //console.log("Sucursal seleccionada:", sucursalSelect);
  const buscarSucursales = async () => {
    try {
      setLoading(true);
      setError(false);
      setMensaje("");
      const respuesta = await obtenerSucursales();
      //console.log("Respuesta sucursales:", respuesta.data[0]);
      if (respuesta.status == 204) {
        setMensaje(
          "No hay sucursales disponibles, por favor crea una sucursal"
        );
      } else {
        if (respuesta.status === 200) {
          setMensaje("");
          setSucursales(respuesta.data);
        }
      }
    } catch (error) {
      setError(true);
      setMensaje("Error al cargar datos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarSucursales();
  }, []);

  const handleCerrarModal = () => {
    setModalCrear(false);
    setModalEditar(false);
  };

  const handleCrear = () => {
    setError(false);
    setMensaje("");
    setModalCrear(true);
  };

  const handleEditar = () => {
    if (!sucursalSelect) {
      setError(true);
      setMensaje("Por favor seleccione una sucursal de la tabla");
      return;
    }
    setError(false);
    setMensaje("");
    setModalEditar(true);
  };

  const handleEliminar = async () => {
    if (!sucursalSelect) {
      setError(true);
      setMensaje("Por favor seleccione una sucursal de la tabla");
      return;
    }
    setLoading(true);
    setError(false);
    setMensaje("");
    try {
      const respuesta = await eliminarSucursal(sucursalSelect.idSucursal);
      if (respuesta.status === 200) {
        setMensaje("Sucursal eliminada exitosamente");
        setError(false);
        setSucursalSelect(null);
        await buscarSucursales();
      } else {
        setError(true);
        setMensaje(respuesta.error || "Error al eliminar la sucursal.");
      }
    } catch (error) {
      setError(true);
      setMensaje("Error de conexión al eliminar la sucursal.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionarFila = (record) => {
    if (sucursalSelect?.idSucursal === record.idSucursal) {
      setSucursalSelect(null);
    } else {
      setSucursalSelect(record);
    }
  };
  const handleVerBodegas = (idSucursal, e) => {
    if (e) e.stopPropagation();

    navigate("/bodega/" + idSucursal);
  };

  const columns = [
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      align: "center",
      render: (estado) => {
        const colores = {
          Abierta: "success",
          Cerrada: "error",
          Mantencion: "warning",
          Eliminada: "default",
        };
        return (
          <span
            style={{
              color:
                colores[estado] === "success"
                  ? "#52c41a"
                  : colores[estado] === "error"
                  ? "#ff4d4f"
                  : colores[estado] === "warning"
                  ? "#faad14"
                  : "#8c8c8c",
            }}
          >
            {estado}
          </span>
        );
      },
    },
    {
      title: "Cod. Sucursal",
      dataIndex: "idSucursal",
      key: "idSucursal",
      align: "center",
      width: 150,
    },
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
    },
    {
      title: "Dirección",
      dataIndex: "direccion",
      key: "direccion",
    },

    {
      title: "Bodegas",
      key: "bodegas",
      align: "center",

      render: (text, record) => (
        <Button
          type="link"
          onClick={(e) => {
            handleVerBodegas(record.idSucursal, e);
            //navigate("/bodega/" + record.idSucursal);
          }}
        >
          Ver Bodegas
        </Button>
      ),
    },
  ];

  return (
    <>
      <Row justify="center" style={{ marginBottom: 24 }}>
        <Col span={24} style={{ textAlign: "center" }}>
          <Title>Gestión de Sucursales</Title>
          <Title level={5} style={{ color: "#8c8c8c", fontWeight: 400 }}>
            Aquí puedes gestionar tus sucursales
          </Title>
        </Col>
      </Row>

      {mensaje && (
        <Row style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Alert
              type={error ? "error" : "success"}
              showIcon
              message={mensaje}
              closable
              onClose={() => setMensaje("")}
            />
          </Col>
        </Row>
      )}

      {sucursales.length === 0 && !loading ? (
        <Row justify="center" style={{ marginTop: 48 }}>
          <Col span={24}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Space direction="vertical" size="large">
                  <div>
                    <Title level={4}>No hay sucursales disponibles</Title>
                    <p style={{ color: "#8c8c8c" }}>
                      Crea tu primera sucursal para comenzar
                    </p>
                  </div>
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={() => handleCrear()}
                  >
                    Crear Primera Sucursal
                  </Button>
                </Space>
              }
            />
          </Col>
        </Row>
      ) : (
        <>
          <Row justify="end" gutter={16} style={{ marginBottom: 16 }}>
            <Col>
              {sucursalSelect && (
                <Alert
                  message={`Sucursal seleccionada: ${sucursalSelect.nombre}`}
                  type="info"
                  showIcon
                  closable
                  onClose={() => setSucursalSelect(null)}
                  style={{ marginBottom: 0 }}
                />
              )}
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCrear}
                disabled={loading}
              >
                Crear Sucursal
              </Button>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEditar}
                disabled={loading || !sucursalSelect}
              >
                Editar Sucursal
              </Button>
            </Col>
            <Col>
              <Popconfirm
                title="¿Está seguro de eliminar esta sucursal?"
                description={`Se eliminará la sucursal: ${
                  sucursalSelect?.nombre || ""
                }`}
                onConfirm={handleEliminar}
                okText="Sí, eliminar"
                cancelText="Cancelar"
                okButtonProps={{ danger: true }}
                disabled={!sucursalSelect}
              >
                <Button
                  type="primary"
                  icon={<DeleteOutlined />}
                  disabled={loading || !sucursalSelect}
                  danger
                >
                  Eliminar Sucursal
                </Button>
              </Popconfirm>
            </Col>
          </Row>

          <Table
            columns={columns}
            dataSource={sucursales}
            rowKey="idSucursal"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total: ${total} sucursales`,
            }}
            onRow={(record) => ({
              onClick: () => handleSeleccionarFila(record),
              style: {
                cursor: "pointer",
                backgroundColor:
                  sucursalSelect?.idSucursal === record.idSucursal
                    ? "#e6f4ff"
                    : "transparent",
                transition: "background-color 0.3s ease",
              },
            })}
            locale={{
              emptyText: "No hay sucursales disponibles",
            }}
          />
        </>
      )}

      <CrearSucursal
        show={modalCrear}
        handleClose={handleCerrarModal}
        buscarSucursales={buscarSucursales}
      />
      <EditarSucursal
        show={modalEditar}
        handleClose={handleCerrarModal}
        sucursal={sucursalSelect}
        funcionBuscarSucursales={buscarSucursales}
      />
      {/* <VerBodegas
        show={modalBodegaVer}
        handleClose={handleCerrarModal}
        //bodega={bodegaSelect}
        buscarSucursales={buscarSucursales}
      /> */}
    </>
  );
}
