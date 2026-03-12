import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  Alert,
  Space,
  Popconfirm,
  Empty,
  Spin,
  Card,
  Row,
  Col,
  notification,
  Tag,
} from "antd";

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LoadingOutlined,
  ShopOutlined,
  RollbackOutlined,
} from "@ant-design/icons";

import DataTable from "../../../components/Tabla";
import {
  obtenerBodegasPorSucursal,
  eliminarBodega,
} from "../../../services/inventario/Bodega.service";
import EditarBodega from "../modales/modalBodega/editarBodega.jsx";
import CrearBodega from "../modales/modalBodega/crearBodega.jsx";
import GestionEstantes from "../modales/Estantes/GestionEstantes.jsx";

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
      width: "10%",
      align: "center",
    },
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      width: "30%",
    },
    {
      title: "Capacidad (uds.)",
      dataIndex: "capacidad",
      key: "capacidad",
      width: "15%",
      align: "center",
      render: (v) => v ? `${v.toLocaleString("es-CL")} uds.` : "—",
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: "20%",
      align: "center",
      render: (estado) => {
        const colores = {
          "En Funcionamiento": "success",
          "En Mantenimiento": "warning",
          "Fuera de Servicio": "error",
          Eliminado: "default",
        };
        return (
          <Tag
            color={colores[estado] || "default"}
            style={{ fontSize: "13px" }}
          >
            {estado}
          </Tag>
        );
      },
    },
    {
      title: "Acciones",
      key: "acciones",
      width: "25%",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<ShopOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleVerEstantes(record.idBodega);
            }}
          >
            Estantes
          </Button>
          <Button
            type="link"
            size="small"
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
              size="small"
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

  // Renderizado condicional para estados de carga y vacío
  if (loading && listaBodegas.length === 0) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin
          indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
          tip="Cargando bodegas..."
          size="large"
        />
      </div>
    );
  }

  if (error && mensaje && listaBodegas.length === 0) {
    return (
      <div style={{ padding: "24px" }}>
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
            size="large"
            icon={<PlusOutlined />}
            onClick={handleCrear}
          >
            Crear Primera Bodega
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <Row gutter={24}>
        <Col span={bodegaParaEstantesId ? 12 : 24}>
          <DataTable
            title="Gestión de Bodegas"
            description={`Bodegas de la sucursal ${idSucursal}`}
            data={listaBodegas}
            columns={columns}
            rowKey="idBodega"
            loading={loading}
            searchableFields={["nombre", "estado"]}
            filterConfig={[
              {
                key: "estado",
                placeholder: "Filtrar por estado",
                options: [
                  { value: "En Funcionamiento", label: "En Funcionamiento" },
                  { value: "En Mantenimiento", label: "En Mantenimiento" },
                  { value: "Fuera de Servicio", label: "Fuera de Servicio" },
                ],
              },
            ]}
            selectedRow={
              bodegaParaEstantesId
                ? listaBodegas.find((b) => b.idBodega === bodegaParaEstantesId)
                : null
            }
            headerButtons={
              <Space size="middle">
                <Button
                  size="large"
                  icon={<RollbackOutlined />}
                  onClick={() => navigate("/admin/sucursales")}
                  style={{ borderRadius: "8px" }}
                >
                  Volver a Sucursales
                </Button>
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={handleCrear}
                  disabled={loading}
                  style={{ borderRadius: "8px" }}
                >
                  Nueva Bodega
                </Button>
              </Space>
            }
          />
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
              style={{ borderRadius: "12px" }}
            >
              <GestionEstantes bodegaId={bodegaParaEstantesId} />
            </Card>
          </Col>
        )}
      </Row>

      {/* Modales */}
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
    </div>
  );
}
