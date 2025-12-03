import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  Table,
  Alert,
  Space,
  Popconfirm,
  Empty,
  Spin,
  Card,
  Row,
  Col,
  notification,
} from "antd";

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LoadingOutlined,
  ShopOutlined,
} from "@ant-design/icons";

import {
  obtenerBodegasPorSucursal,
  eliminarBodega,
} from "../services/inventario/Bodega.service";
import EditarBodega from "../components/inventario/modalBodega/editarBodega.jsx";
import CrearBodega from "../components/inventario/modalBodega/crearBodega.jsx";
import GestionEstantes from "../components/inventario/Estantes/GestionEstantes.jsx";

export default function Bodega() {
  const { idSucursal } = useParams();
  const navigate = useNavigate();
  // console.log("ID Sucursal desde Bodega.jsx:", idSucursal);
  const { Title } = Typography;

  const [listaBodegas, setListaBodegas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [bodegaSelect, setBodegaSelect] = useState(null);
  const [modalCrear, setModalCrear] = useState(false);

  const [bodegaParaEstantesId, setBodegaParaEstantesId] = useState(null);

  const cargarDatosBodega = useCallback(async () => {
    if (!idSucursal) return;
    setLoading(true);
    setError(false);
    setMensaje("");
    setListaBodegas([]);
    try {
      const respuesta = await obtenerBodegasPorSucursal(idSucursal);
      //console.log("Respuesta al obtener bodegas:", respuesta);
      if (respuesta.status === 200) {
        setListaBodegas(respuesta.data);
        notification.success({
          message: "Éxito",
          description: "Bodegas cargadas exitosamente",
          placement: "topRight",
          duration: 4.5,
        });
      } else if (respuesta.status === 204) {
        setListaBodegas([]);
        notification.info({
          message: "Información",
          description: "Esta sucursal no tiene bodegas registradas.",
        });
        setError(true);
        setMensaje("Esta sucursal no tiene bodegas registradas.");
      } else {
        setError(true);
        setMensaje("Error al cargar las bodegas.");
      }
    } catch (error) {
      setError(true);
      setMensaje("Error de conexión al buscar bodegas.");
      notification.error({
        message: "Error",
        description: error.mensaje || "Error de conexión al buscar bodegas.",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [idSucursal]);

  useEffect(() => {
    cargarDatosBodega();
  }, [cargarDatosBodega]);

  const handleVerEstantes = (bodegaId) => {
    if (bodegaParaEstantesId === bodegaId) {
      setBodegaParaEstantesId(null);
    } else {
      setBodegaParaEstantesId(bodegaId);
    }
  };

  const handleCrear = () => {
    setError(false);
    setMensaje("");
    setModalCrear(true);
    setBodegaParaEstantesId(null);
  };

  const handleEditar = (b) => {
    setError(false);
    setBodegaSelect(b);
    setMensaje("");
    setModalEditar(true);
    setBodegaParaEstantesId(null);
  };

  const handleCerrarModal = () => {
    setModalEditar(false);
    setBodegaSelect(null);
    setModalCrear(false);
  };

  const handleEliminar = async (id) => {
    setLoading(true);
    setError(false);
    setMensaje("");
    try {
      const respuesta = await eliminarBodega(id);
      if (respuesta.status === 200) {
        setMensaje("Bodega eliminada exitosamente");
        notification.success({
          message: "Éxito",
          description: "Bodega eliminada exitosamente",
          placement: "topRight", // topLeft, topRight, bottomLeft, bottomRight
          duration: 4.5,
        });
        setError(false);
        setBodegaParaEstantesId(null);
        await cargarDatosBodega();
      } else {
        setError(true);
        notification.error({
          message: "Error",
          description: respuesta.error || "Error al eliminar la bodega.",
        });
        setMensaje(respuesta.error || "Error al eliminar la bodega.");
      }
    } catch (error) {
      setError(true);
      setMensaje("Error de conexión al eliminar la bodega.");
      notification.error({
        message: "Error",
        description:
          error?.response?.data?.message ||
          "Error de conexión al eliminar la bodega.",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "idBodega",
      key: "idBodega",
      align: "center",
      responsive: ["sm"],
    },
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      responsive: ["sm"],
    },
    {
      title: "Capacidad m²",
      dataIndex: "capacidad",
      key: "capacidad",
      align: "center",
      responsive: ["sm"],
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      align: "center",
      responsive: ["sm"],
      render: (estado) => {
        const colores = {
          "En Funcionamiento": "#52c41a",
          "En Mantenimiento": "#faad14",
          "Fuera de Servicio": "#ff4d4f",
          Eliminado: "#8c8c8c",
        };
        return (
          <span style={{ color: colores[estado] || "#8c8c8c" }}>{estado}</span>
        );
      },
    },

    {
      title: "Estantes",
      key: "estantes",
      align: "center",
      responsive: ["sm"],
      render: (_, record) => (
        <Button
          type="link"
          icon={<ShopOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            handleVerEstantes(record.idBodega);
          }}
        >
          Ver
        </Button>
      ),
    },
    {
      title: "Acciones",
      key: "acciones",
      align: "center",
      responsive: ["sm"],
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleEditar(record);
            }}
            disabled={loading}
          />
          <Popconfirm
            title="¿Eliminar esta bodega?"
            description="Esta acción no se puede deshacer."
            onConfirm={(e) => {
              e?.stopPropagation();
              handleEliminar(record.idBodega);
            }}
            okText="Sí"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => e.stopPropagation()}
              disabled={loading}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderContenido = () => {
    if (loading && listaBodegas.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
            tip="Cargando bodegas..."
          >
            <div style={{ padding: 50 }} /> {/* Contenido vacío */}
          </Spin>
        </div>
      );
    }

    if (error && mensaje && listaBodegas.length === 0) {
      return (
        <>
          <Alert
            message={mensaje}
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Empty
            description="No hay bodegas registradas"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCrear}
            >
              Crear Primera Bodega
            </Button>
          </Empty>
        </>
      );
    }

    return (
      <div>
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCrear}
            disabled={loading}
          >
            Crear Bodega
          </Button>

          {/* {mensaje && !error && (
            <Alert
              message={mensaje}
              type="success"
              showIcon
              style={{ flexGrow: 1, marginLeft: 16 }}
              closable
              onClose={() => setMensaje("")}
            />
          )} */}
        </div>

        <Table
          columns={columns}
          dataSource={listaBodegas}
          rowKey="idBodega"
          loading={loading}
          pagination={{
            pageSize: 5,
            showSizeChanger: false,
            showTotal: (total) => `Total: ${total} bodegas`,
          }}
          scroll={{ x: 500 }}
          onRow={(record) => ({
            style: {
              cursor: "pointer",
              backgroundColor:
                bodegaParaEstantesId === record.idBodega
                  ? "#e6f7ff"
                  : "transparent",
            },
          })}
        />
      </div>
    );
  };

  return (
    <>
      <Title level={3}>Gestión de Bodegas</Title>
      {/* <Button type="primary" onClick={() => navigate("/admin/sucursal")}>
        Volver
      </Button> */}

      <Row
        justify="center"
        gutter={24}
        style={{ padding: "24px", marginTop: "20px" }}
      >
        <Col span={bodegaParaEstantesId ? 12 : 16}>
          <Card
            title={`Gestión de Bodegas (Sucursal ${idSucursal})`}
            extra={
              <Button
                type="primary"
                onClick={() => navigate("/admin/sucursales")}
              >
                Volver a Sucursales
              </Button>
            }
            width={bodegaParaEstantesId ? "100%" : "80%"}
          >
            {renderContenido()}
          </Card>
        </Col>

        {bodegaParaEstantesId && (
          <Col span={12}>
            <Card
              title={`Estantes de la Bodega ${bodegaParaEstantesId}`}
              extra={
                <Button
                  type="link"
                  danger
                  onClick={() => setBodegaParaEstantesId(null)}
                >
                  Cerrar
                </Button>
              }
            >
              <GestionEstantes
                bodegaId={bodegaParaEstantesId}
                // onVolver={() => setBodegaParaEstantesId(null)}
              />
            </Card>
          </Col>
        )}
      </Row>

      <CrearBodega
        show={modalCrear}
        handleClose={handleCerrarModal}
        buscarBodegas={cargarDatosBodega}
        idSucursal={idSucursal}
      />
      <EditarBodega
        show={modalEditar}
        bodegas={bodegaSelect}
        handleClose={handleCerrarModal}
        buscarBodegas={cargarDatosBodega}
      />
    </>
  );
}
