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
  Input,
  Select,
  notification,
  Card,
  Divider,
} from "antd";

const { Search } = Input;
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

// Servicios
import obtenerInventarios from "../services/inventario/Inventario.service";

import obtenerSucursales from "../services/inventario/Sucursal.service";

// Modales
import CrearInventario from "../components/inventario/modalInventario/CrearInventario";
import EditarInventario from "../components/inventario/modalInventario/EditarInventario";

export default function Inventario() {
  const { Title, Text } = Typography;
  const [inventarios, setInventarios] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null);
  const [loading, setLoading] = useState(false);
  // const [searchText, setSearchText] = useState("");

  // const inventariosFiltrados = inventarios.filter((item) => {
  //   const searchLower = searchText.toLowerCase();
  //   return (
  //     item.producto?.idProducto?.toString().includes(searchLower) ||
  //     item.producto?.nombre?.toLowerCase().includes(searchLower) ||
  //     item.lote?.codigo?.toString().includes(searchLower) ||
  //     item.cantidad?.toString().includes(searchLower)
  //   );
  // });

  const buscarSucursales = async () => {
    setLoading(true);
    try {
      const response = await obtenerSucursales();
      console.log("Respuesta sucursales:", response);
      if (response.status === 200) {
        setSucursales(response.data || []);
        setLoading(false);
        notification.success({
          message: "Éxito",
          description: "Sucursales cargadas correctamente",
        });
        return;
      }
      if (response.status === 204) {
        notification.info({
          message: "Información",
          description: "No hay sucursales disponibles",
        });
        setSucursales([]);
        setLoading(false);
        return;
      }
      notification.error({
        message: "Error",
        description: response.error || "No se pudieron cargar las sucursales",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: "No se pudieron cargar las sucursales",
      });
      setSucursales([]);
      setLoading(false);
      console.error("Error al obtener sucursales:", error);
    } finally {
      setLoading(false);
    }
  };

  const cargarInventarios = async () => {
    try {
      setLoading(true);
      const response = await obtenerInventarios();
      console.log("Respuesta inventarios:", response);
      if (!response) {
        notification.error({
          message: "Error",
          description: "No se pudieron cargar los productos",
        });
        setInventarios([]);
        return;
      }

      if (response.status === 422) {
        notification.warning({
          message: "Advertencia",
          description: "No hay productos en el inventario",
        });
        setInventarios([]);
        return;
      }

      const data = response.data || response;
      setInventarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener inventarios:", error);
      notification.error({
        message: "Error",
        description: "No se pudieron cargar los productos",
      });
      setInventarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarSucursales();
  }, []);

  const handleSucursalSeleccionada = (value) => {
    console.log(`Sucursal seleccionada: ${value}`);
    setSucursalSeleccionada(sucursales.find((s) => s.idSucursal === value));
    cargarInventarios();
  };

  return (
    <>
      <Row>
        <Col>
          <Title level={2}>Gestión de Inventario</Title>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Text>Selecciona sucursal:</Text>
          <br />
          <Select
            style={{ width: 200, marginTop: 8 }}
            placeholder="Seleccionar Sucursal"
            onChange={(value) => handleSucursalSeleccionada(value)}
          >
            {sucursales.map((sucursal) => (
              <Select.Option
                key={sucursal.idSucursal}
                value={sucursal.idSucursal}
              >
                {sucursal.nombre}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>
      <Divider />
      {sucursalSeleccionada && (
        <Row>
          <Col span={24}>
            <Card>
              <Title level={4}>
                Inventario de la Sucursal: {sucursalSeleccionada.nombre}
              </Title>
              <Text>Dirección: {sucursalSeleccionada.direccion}</Text>
              <Divider />
              <Table
                dataSource={inventarios}
                loading={loading}
                rowKey="idInventario"
                columns={[
                  {
                    title: "Código Producto",
                    dataIndex: ["producto", "idProducto"],
                    key: "idProducto",
                  },
                  {
                    title: "Producto",
                    dataIndex: ["producto", "nombre"],
                    key: "nombre",
                  },
                  {
                    title: "Stock",
                    dataIndex: "cantidad",
                    key: "cantidad",
                  },
                  {
                    title: "Lote",
                    dataIndex: ["lote", "codigo"],
                    key: "lote",
                  },
                  {
                    title: "Estado",
                    dataIndex: "estado",
                    key: "estado",
                  },
                ]}
                pagination={{ pageSize: 5 }}
                locale={{
                  emptyText: (
                    <Empty
                      description={
                        loading
                          ? "Cargando inventario..."
                          : "No hay inventario disponible para esta sucursal, ingrese compras"
                      }
                    />
                  ),
                }}
              />
            </Card>
          </Col>
        </Row>
      )}
    </>
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
