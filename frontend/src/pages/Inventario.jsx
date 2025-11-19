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
  Spin,
  message,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

// Servicios
import obtenerInventarios, {
  eliminarInventario,
} from "../services/inventario/Inventario.service";

// Modales
import CrearInventario from "../components/inventario/modalInventario/CrearInventario";
import EditarInventario from "../components/inventario/modalInventario/EditarInventario";

export default function Inventario() {
  const { Title } = Typography;
  const [inventarios, setInventarios] = useState([]);
  const [error, setError] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const [inventarioSelect, setInventarioSelect] = useState(null);

  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);

  const cargarInventarios = async () => {
    try {
      setLoading(true);
      const response = await obtenerInventarios();

      if (!response) {
        message.error("Error al obtener inventarios");
        setInventarios([]);
        return;
      }

      if (response.status === 422) {
        message.warning("No hay productos en el inventario");
        setInventarios([]);
        return;
      }

      // Asumiendo que la respuesta tiene la data en response.data
      const data = response.data || response;
      setInventarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener inventarios:", error);
      message.error("No se pudieron cargar los productos");
      setInventarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarInventarios();
  }, []);

  const handleCerrarModal = () => {
    setModalCrear(false);
    setModalEditar(false);
    setInventarioSelect(null);
  };

  const handleCrear = () => {
    setError(false);
    setMensaje("");
    setModalCrear(true);
  };

  const handleEditar = () => {
    if (!inventarioSelect) {
      setError(true);
      setMensaje("Por favor seleccione un registro de la tabla");
      return;
    }
    setError(false);
    setMensaje("");
    setModalEditar(true);
  };

  const handleEliminar = async () => {
    if (!inventarioSelect) {
      setError(true);
      setMensaje("Por favor seleccione un registro de la tabla");
      return;
    }

    setLoading(true);
    setError(false);
    setMensaje("");
    try {
      // Asumo que tienes un servicio 'eliminarInventario'
      const respuesta = await eliminarInventario(inventarioSelect.idInventario);
      if (respuesta.status === 200) {
        setMensaje("Entrada de inventario eliminada exitosamente");
        setError(false);
        setInventarioSelect(null);
        await cargarInventarios();
      } else {
        setError(true);
        setMensaje(respuesta.error || "Error al eliminar la entrada.");
      }
    } catch (error) {
      setError(true);
      setMensaje("Error de conexión al eliminar la entrada.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const handleSeleccionarFila = (record) => {
    if (inventarioSelect?.idInventario === record.idInventario) {
      setInventarioSelect(null);
    } else {
      setInventarioSelect(record);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "idInventario",
      key: "idInventario",
      align: "center",
      width: 80,
    },
    {
      title: "Producto",
      dataIndex: "nombre", // Asumiendo que 'nombre' viene en el objeto
      key: "nombre",
    },
    {
      title: "Cod. Bodega",
      dataIndex: "idBodega",
      key: "idBodega",
      align: "center",
      width: 120,
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      align: "center",
      width: 100,
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      align: "center",
      width: 150,
    },
    {
      title: "Encargado",
      dataIndex: "encargado",
      key: "encargado",
    },
    // Puedes añadir más columnas como 'Lote', 'idProducto', etc.
  ];

  const renderContenido = () => {
    if (loading && inventarios.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <Spin size="large" tip="Cargando inventario..." />
        </div>
      );
    }

    if (inventarios.length === 0) {
      return (
        <Row justify="center" style={{ marginTop: 48 }}>
          <Col span={24}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Space direction="vertical" size="large">
                  <div>
                    <Title level={4}>No hay inventario registrado</Title>
                    <p style={{ color: "#8c8c8c" }}>
                      Crea tu primera entrada de inventario para comenzar
                    </p>
                  </div>
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={handleCrear}
                  >
                    Añadir Primera Entrada
                  </Button>
                </Space>
              }
            />
          </Col>
        </Row>
      );
    }

    return (
      <>
        <Row justify="end" gutter={16} style={{ marginBottom: 16 }}>
          <Col flex="auto">
            {inventarioSelect && (
              <Alert
                message={`Registro seleccionado: ID ${inventarioSelect.idInventario} (${inventarioSelect.nombre})`}
                type="info"
                showIcon
                closable
                onClose={() => setInventarioSelect(null)}
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
              Añadir Inventario
            </Button>
          </Col>
          <Col>
            <Button
              type="primary" // O 'default' si prefieres
              icon={<EditOutlined />}
              onClick={handleEditar}
              disabled={loading || !inventarioSelect}
            >
              Modificar Stock
            </Button>
          </Col>
          <Col>
            <Popconfirm
              title="¿Está seguro de eliminar esta entrada?"
              description={`Se eliminará el registro: ${
                inventarioSelect?.nombre || ""
              } (ID: ${inventarioSelect?.idInventario || ""})`}
              onConfirm={handleEliminar}
              okText="Sí, eliminar"
              cancelText="Cancelar"
              okButtonProps={{ danger: true }}
              disabled={!inventarioSelect}
            >
              <Button
                type="primary"
                icon={<DeleteOutlined />}
                disabled={loading || !inventarioSelect}
                danger
              >
                Eliminar Entrada
              </Button>
            </Popconfirm>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={inventarios}
          rowKey="idInventario"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} registros`,
          }}
          onRow={(record) => ({
            onClick: () => handleSeleccionarFila(record),
            style: {
              cursor: "pointer",
              backgroundColor:
                inventarioSelect?.idInventario === record.idInventario
                  ? "#e6f4ff"
                  : "transparent",
              transition: "background-color 0.3s ease",
            },
          })}
          locale={{
            emptyText: "No hay registros de inventario disponibles",
          }}
        />
      </>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <Row justify="center" style={{ marginBottom: 24 }}>
        <Col span={24} style={{ textAlign: "center" }}>
          <Title>Gestión de Inventario</Title>
          <Title level={5} style={{ color: "#8c8c8c", fontWeight: 400 }}>
            Aquí puedes gestionar el stock de productos en tus bodegas
          </Title>
        </Col>
      </Row>

      {mensaje &&
        !loading && ( // Oculta el mensaje si está cargando
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

      {renderContenido()}

      <CrearInventario
        show={modalCrear}
        handleClose={handleCerrarModal}
        buscarInventarios={cargarInventarios}
      />
      <EditarInventario
        show={modalEditar}
        handleClose={handleCerrarModal}
        inventario={inventarioSelect}
        buscarInventarios={cargarInventarios}
      />
    </div>
  );
  // return (
  //   <Container style={{ marginTop: "30px" }}>
  //     <Row className="mb-4 text-center align-items-center">
  //       <Col className="text-center align-items-center">
  //         <h2>Gestión de Inventario</h2>
  //       </Col>
  //     </Row>
  //     <Row className="mb-3">
  //       <Col md={3}>
  //         <Button variant="primary" onClick={handleCrear} disabled={loading}>
  //           Añadir Inventario
  //         </Button>
  //       </Col>
  //     </Row>
  //     <Row>
  //       <Table striped bordered hover>
  //         <thead>
  //           <tr>
  //             <th>CP</th>
  //             <th>Producto</th>
  //             <th>Stock</th>
  //             <th>Estado</th>
  //             <th>Lote</th>
  //           </tr>
  //         </thead>
  //       </Table>
  //     </Row>
  //     <CrearInventario
  //       show={modalCrear}
  //       handleClose={handleCerrarModal}
  //       buscarInventarios={buscarInventarios}
  //     />
  //   </Container>
  //   // <Container style={{ marginTop: "30px" }}>
  //   //   <Row className="mb-4 text-center align-items-center">
  //   //     <Col className="text-center align-items-center">
  //   //       <h2>Gestión de Inventario</h2>
  //   //       <p className="text-muted">
  //   //         Aquí puedes gestionar el stock de productos en tus bodegas
  //   //       </p>
  //   //     </Col>
  //   //   </Row>
  //   //   {mensaje && (
  //   //     <Row className="mb-3">
  //   //       <Col>
  //   //         <Alert
  //   //           variant={error ? "danger" : "success"}
  //   //           dismissible
  //   //           onClose={() => setMensaje("")}
  //   //         >
  //   //           {mensaje}
  //   //         </Alert>
  //   //       </Col>
  //   //     </Row>
  //   //   )}
  //   //   {/* Botones de acción */}
  //   //   <Row className="mb-4">
  //   //     <Col md={3}>
  //   //       <Button
  //   //         variant="primary"
  //   //         onClick={handleCrear}
  //   //         disabled={loading}
  //   //         className="w-100"
  //   //       >
  //   //         Añadir Inventario
  //   //       </Button>
  //   //     </Col>
  //   //   </Row>
  //   //   <Row>
  //   //     {
  //   //       loading && inventarios.length === 0
  //   //         ? [...Array(3)].map((_, index) => (
  //   //             <Col md={4} className="mb-4" key={index}>
  //   //               <Card>
  //   //                 <Card.Body>
  //   //                   <Placeholder as={Card.Title} animation="glow">
  //   //                     <Placeholder xs={6} />
  //   //                   </Placeholder>
  //   //                   <Placeholder as={Card.Text} animation="glow">
  //   //                     <Placeholder xs={7} /> <br />
  //   //                     <Placeholder xs={4} /> <br />
  //   //                     <Placeholder xs={4} /> <br />
  //   //                     <Placeholder xs={6} />
  //   //                   </Placeholder>
  //   //                 </Card.Body>
  //   //                 <Card.Footer>
  //   //                   <ButtonGroup className="w-100">
  //   //                     <Placeholder.Button variant="warning" xs={6} />
  //   //                     <Placeholder.Button variant="danger" xs={6} />
  //   //                   </ButtonGroup>
  //   //                 </Card.Footer>
  //   //               </Card>
  //   //             </Col>
  //   //           ))
  //   //         : inventarios.length > 0
  //   //         ? inventarios.map((inventario) => (
  //   //             <Col key={inventario.idInventario} md={4} className="mb-4">
  //   //               {" "}
  //   //               {/* Asumo 'idInventario' como key */}
  //   //               <Card>
  //   //                 <Card.Body>
  //   //                   {/* Asumo que los datos vienen anidados */}
  //   //                   <Card.Title>{inventario?.nombre}</Card.Title>
  //   //                   <Card.Subtitle className="mb-2 text-muted">
  //   //                     Codigo: {inventario?.idInventario}
  //   //                   </Card.Subtitle>
  //   //                   <Card.Text>
  //   //                     <strong>Codigo Bodega:</strong> {inventario?.idBodega}
  //   //                     <br />
  //   //                     <strong>Codigo Producto:</strong>{" "}
  //   //                     {inventario?.idProducto}
  //   //                     <br />
  //   //                     <strong>Encargado:</strong> {inventario?.encargado}
  //   //                     <br />
  //   //                     <strong>Stock Actual:</strong> {inventario.stock}{" "}
  //   //                     unidades
  //   //                     <br />
  //   //                     <strong>Estado:</strong> {inventario?.estado}
  //   //                   </Card.Text>
  //   //                 </Card.Body>
  //   //                 <Card.Footer>
  //   //                   <ButtonGroup className="w-100">
  //   //                     <Button
  //   //                       variant="warning"
  //   //                       onClick={() => handleEditar(inventario)}
  //   //                       disabled={true}
  //   //                     >
  //   //                       Modificar Stock
  //   //                     </Button>
  //   //                     <Button
  //   //                       variant="danger"
  //   //                       onClick={() =>
  //   //                         handleEliminar(inventario.idInventario)
  //   //                       }
  //   //                       disabled={loading}
  //   //                     >
  //   //                       Eliminar
  //   //                     </Button>
  //   //                   </ButtonGroup>
  //   //                 </Card.Footer>
  //   //               </Card>
  //   //             </Col>
  //   //           ))
  //   //         : !loading && (
  //   //             <Col>
  //   //               <p>{mensaje}</p>
  //   //             </Col>
  //   //           ) // Muestra el mensaje si no hay datos
  //   //     }
  //   //   </Row>

  //   //   {/* Modales */}
  //   //   <CrearInventario
  //   //     show={modalCrear}
  //   //     handleClose={handleCerrarModal}
  //   //     buscarInventarios={buscarInventarios}
  //   //   />
  //   //   <EditarInventario
  //   //     show={modalEditar}
  //   //     handleClose={handleCerrarModal}
  //   //     inventario={inventarioSelect}
  //   //     buscarInventarios={buscarInventarios}
  //   //   />
  //   // </Container>
  // );
}
