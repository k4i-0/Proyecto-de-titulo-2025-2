import { useEffect, useState, useCallback } from "react";
import {
  Modal,
  Button,
  Table,
  Alert,
  Space,
  Popconfirm,
  Empty,
  Spin,
} from "antd";

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

import {
  obtenerBodegasPorSucursal,
  eliminarBodega,
} from "../../../services/inventario/Bodega.service";
import EditarBodega from "../modalBodega/editarBodega";
import CrearBodega from "../modalBodega/crearBodega";

export default function VerBodegas({
  show,
  handleClose,
  bodega,
  buscarSucursales,
}) {
  const idSucursal = bodega;

  const [listaBodegas, setListaBodegas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [bodegaSelect, setBodegaSelect] = useState(null);
  const [modalCrear, setModalCrear] = useState(false);

  const cargarDatosBodega = useCallback(async () => {
    if (!idSucursal) return;

    setLoading(true);
    setError(false);
    setMensaje("");
    setListaBodegas([]);

    try {
      const respuesta = await obtenerBodegasPorSucursal(idSucursal);
      console.log("Respuesta bodegas por sucursal:", respuesta);
      if (respuesta.status === 200) {
        setListaBodegas(respuesta.data);
      } else if (respuesta.status === 204) {
        setListaBodegas([]);
        setError(true);
        setMensaje("Esta sucursal no tiene bodegas registradas.");
      } else {
        setError(true);
        setMensaje("Error al cargar las bodegas.");
      }
    } catch (error) {
      setError(true);
      setMensaje("Error de conexión al buscar bodegas.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [idSucursal]);

  useEffect(() => {
    if (show) {
      cargarDatosBodega();
    }
  }, [show, cargarDatosBodega]);
  // useEffect(() => {
  //   if (show && idSucursal) {
  //     const cargarDatosBodega = async () => {
  //       setLoading(true);
  //       setError(false);
  //       setMensaje("");
  //       setListaBodegas([]);

  //       try {
  //         const respuesta = await obtenerBodegasPorSucursal(idSucursal);
  //         console.log("Respuesta bodegas por sucursal:", respuesta);
  //         if (respuesta.status === 200) {
  //           setListaBodegas(respuesta.data);
  //         } else if (respuesta.status === 204) {
  //           setError(true);
  //           setMensaje("Esta sucursal no tiene bodegas registradas.");
  //         } else {
  //           setError(true);
  //           setMensaje("Error al cargar las bodegas.");
  //         }
  //       } catch (error) {
  //         setError(true);
  //         setMensaje("Error de conexión al buscar bodegas.");
  //         console.error(error);
  //       } finally {
  //         setLoading(false);
  //       }
  //     };

  //     cargarDatosBodega();
  //   }
  // }, [show, idSucursal]);

  const handleCrear = () => {
    setError(false);
    setMensaje("");
    setModalCrear(true);
  };

  const handleEditar = (b) => {
    setError(false);
    setBodegaSelect(b);
    setMensaje("");
    setModalEditar(true);
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
        setError(false);
        await cargarDatosBodega();
      } else {
        setError(true);
        setMensaje(respuesta.error || "Error al eliminar la bodega.");
      }
    } catch (error) {
      setError(true);
      setMensaje("Error de conexión al eliminar la bodega.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const columns = [
    {
      title: "ID Bodega",
      dataIndex: "idBodega",
      key: "idBodega",
      align: "center",
      width: 120,
    },
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
    },
    {
      title: "Capacidad m²",
      dataIndex: "capacidad",
      key: "capacidad",
      align: "center",
      width: 150,
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      align: "center",
      width: 180,
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
      title: "Acciones",
      key: "acciones",
      align: "center",
      width: 120,
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
          >
            Editar
          </Button>
          <Popconfirm
            title="¿Está seguro de eliminar esta bodega?"
            description="Esta acción no se puede deshacer."
            onConfirm={(e) => {
              e?.stopPropagation();
              handleEliminar(record.idBodega);
            }}
            okText="Sí, eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => e.stopPropagation()}
              disabled={loading}
            >
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderContenido = () => {
    if (loading) {
      return (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
            tip="Cargando bodegas..."
          />
        </div>
      );
    }

    if (error && mensaje) {
      return (
        <>
          <Alert
            message={mensaje}
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            closable
            onClose={() => {
              setError(false);
              setMensaje("");
            }}
          />
          {listaBodegas.length === 0 && (
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
          )}
        </>
      );
    }

    if (listaBodegas.length > 0) {
      return (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCrear}
              disabled={loading}
            >
              Crear Bodega
            </Button>
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
            onRow={(record) => ({
              onClick: () => handleEditar(record),
              style: { cursor: "pointer" },
            })}
          />

          <CrearBodega
            show={modalCrear}
            handleClose={handleCerrarModal}
            buscarBodegas={buscarSucursales}
            idSucursal={idSucursal}
          />
          <EditarBodega
            show={modalEditar}
            bodegas={bodegaSelect}
            handleClose={handleCerrarModal}
            buscarBodegas={buscarSucursales}
          />
        </div>
      );
    }

    return (
      <Empty
        description="No hay información para mostrar"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  };

  return (
    <Modal
      open={show}
      onCancel={handleClose}
      title={`Detalle de Bodegas (Sucursal: ${idSucursal})`}
      width={900}
      footer={[
        <Button key="cerrar" onClick={handleClose}>
          Cerrar
        </Button>,
      ]}
    >
      {renderContenido()}
    </Modal>
  );

  // const renderContenido = () => {
  //   if (loading) {
  //     return (
  //       <div className="text-center my-3">
  //         <Spinner animation="border" role="status">
  //           <span className="visually-hidden">Cargando...</span>
  //         </Spinner>
  //         <p className="mt-2">Cargando bodegas...</p>
  //       </div>
  //     );
  //   }

  //   if (error) {
  //     return <Alert variant="warning">{mensaje}</Alert>;
  //   }

  //   if (listaBodegas.length > 0) {
  //     return (
  //       <div>
  //         <Button variant="info" onClick={() => handleCrear()}>
  //           Crear
  //         </Button>

  //         <Table striped bordered hover responsive>
  //           <thead className="text-center">
  //             <tr>
  //               <th>ID Bodega</th>
  //               <th>Nombre</th>
  //               <th>Capacidad m²</th>
  //               <th>Estado</th>
  //               <th>Acciones</th>
  //             </tr>
  //           </thead>
  //           <tbody className="text-center">
  //             {listaBodegas.map((b) => (
  //               <tr key={b.idBodega} onClick={() => handleEditar(b)}>
  //                 <td>{b.idBodega}</td>
  //                 <td>{b.nombre}</td>
  //                 <td>{b.capacidad}</td>
  //                 <td>{b.estado}</td>
  //                 <td>
  //                   <Button
  //                     variant="info"
  //                     onClick={() => handleEliminar(b.idBodega)}
  //                   >
  //                     Eliminar
  //                   </Button>
  //                 </td>
  //               </tr>
  //             ))}
  //           </tbody>
  //         </Table>
  //         <CrearBodega
  //           show={modalCrear}
  //           handleClose={handleCerrarModal}
  //           buscarBodegas={buscarSucursales}
  //           idSucursal={idSucursal}
  //         />
  //         <EditarBodega
  //           show={modalEditar}
  //           bodegas={bodegaSelect}
  //           handleClose={handleCerrarModal}
  //           buscarBodegas={buscarSucursales}
  //         />
  //       </div>
  //     );
  //   }

  //   return <Alert variant="info">No hay información para mostrar.</Alert>;
  // };

  // return (
  //   <Modal show={show} onHide={handleClose} size="lg" centered>
  //     <Modal.Header closeButton>
  //       <Modal.Title>Detalle de Bodegas (Sucursal: {idSucursal})</Modal.Title>
  //     </Modal.Header>
  //     <Modal.Body>{renderContenido()}</Modal.Body>
  //     <Modal.Footer>
  //       <Button variant="secondary" onClick={handleClose}>
  //         Cerrar
  //       </Button>
  //     </Modal.Footer>
  //   </Modal>
  // );
}
