import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  Row,
  Col,
  Form,
  Input,
  Button,
  message,
  Card,
  Select,
  Typography,
  Divider,
  Spin,
  Empty,
  Modal,
  DatePicker,
  Tag,
  Space,
  Popconfirm,
  Drawer,
  List,
} from "antd";

import {
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
  TeamOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

//codigo SII
import girosSII from "../services/codigoSII.js";

import {
  getAllProveedores,
  crearProveedor,
  editarProveedor,
  eliminarProveedor,
  getAllProveedoresVendedor,
  crearVendedor,
} from "../services/inventario/Proveedor.service.js";
import Alert from "antd/es/alert/Alert.js";

export default function Aprovisionamiento() {
  const navigator = useNavigate();
  const { idSucursal } = useParams();
  const [proveedores, setProveedores] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [verModalCrear, setVerModalCrear] = useState(false);
  const [verModalEditar, setVerModalEditar] = useState(false);
  const [verDrawerVendedores, setVerDrawerVendedores] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [form] = Form.useForm();
  const [formVendedor] = Form.useForm();

  const [childrenDrawer, setChildrenDrawer] = useState(false);

  const obtenerProveedores = async () => {
    try {
      setLoading(true);
      const response = await getAllProveedores();
      //console.log("Respuesta proveedores:", response);
      if (response.status === 200) {
        //console.log("Proveedores:", response.data);
        setProveedores(response.data);
        setLoading(false);
        return;
      }
      if (response.status === 204) {
        message.info("No hay proveedores registrados");
        setProveedores([]);
        setLoading(false);
        return;
      }
      message.error("Error en el servidor al obtener los proveedores");
      setLoading(false);
    } catch (error) {
      message.error("Error al obtener los proveedores");
      console.error("Error al obtener los proveedores:", error);
      setLoading(false);
    }
  };
  const buscarVendedoresSucursal = async (rutProveedor) => {
    try {
      setLoading(true);
      const respuesta = await getAllProveedoresVendedor(rutProveedor);
      if (respuesta.status === 200) {
        message.success("Vendedores obtenidos correctamente");
        setVendedores(respuesta.data);
        setLoading(false);
        return;
      }
      if (respuesta.status === 204) {
        message.info("No hay vendedores registrados para este proveedor");
        setVendedores([]);
        setLoading(false);
        return;
      }
      message.error("Error en el servidor al obtener los vendedores");
      setLoading(false);
    } catch (error) {
      message.error("Error al obtener los vendedores");
      console.error("Error al obtener los vendedores:", error);
      setLoading(false);
    }
  };
  useEffect(() => {
    obtenerProveedores();
  }, []);

  const handelCrearProveedor = () => {
    setVerModalCrear(true);
  };

  const handleSubmitVendedor = async (values) => {
    //console.log("Datos del vendedor a crear:", values);
    try {
      setLoading(true);
      const vendedorData = {
        ...values,
        rutProveedor: proveedorSeleccionado.rut,
      };
      const respuesta = await crearVendedor(vendedorData);
      console.log("Respuesta crear vendedor:", respuesta);
      if (respuesta.status === 200) {
        message.success("Vendedor creado exitosamente");
        formVendedor.resetFields();
        buscarVendedoresSucursal(proveedorSeleccionado.rut);
        setChildrenDrawer(false);
        return;
      }
      if (respuesta.status === 422) {
        message.error("Faltan datos obligatorios para crear el vendedor");
      }
      message.error(
        respuesta.error || "Error en el servidor al crear el vendedor"
      );
      setLoading(false);
    } catch (error) {
      message.error("Error al crear el vendedor");
      console.error("Error al crear el vendedor:", error);
      setLoading(false);
    }
  };

  const handleSubmitCrear = async (values) => {
    try {
      setLoading(true);
      // Formatear la fecha si es necesario
      const proveedorData = {
        ...values,
        fechaIngreso: values.fechaIngreso.format("YYYY-MM-DD"), // Ajusta el formato según tu backend
      };
      //console.log("Datos del proveedor a crear:", proveedorData);

      const response = await crearProveedor(proveedorData);

      if (response.status === 201) {
        message.success("Proveedor creado exitosamente");
        setVerModalCrear(false);
        form.resetFields();
        obtenerProveedores();
        return;
      }
      if (response.status === 422) {
        message.info("Faltan datos obligatorios para crear el proveedor");
        return;
      }

      message.error(
        response.error || "Error en el servidor al crear el proveedor"
      );
      setLoading(false);
      return;
    } catch (error) {
      message.error("Error al crear el proveedor");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleCancel = () => {
    setVerModalCrear(false);
    setVerModalEditar(false);
    form.resetFields();
    setProveedorSeleccionado(null);
  };

  const handleAbrirVendedores = () => {
    buscarVendedoresSucursal(proveedorSeleccionado.rut);
    setVerDrawerVendedores(true);
  };
  const handleCrearProveedor = () => {
    setVerModalCrear(true);
  };

  const handleSeleccionarProveedor = (proveedor) => {
    // console.log("Proveedor seleccionado:", proveedor);
    if (proveedorSeleccionado?.idProveedor === proveedor.idProveedor) {
      setProveedorSeleccionado(null);
    } else {
      setProveedorSeleccionado(proveedor);
    }
  };

  const showChildrenDrawer = () => {
    setChildrenDrawer(!childrenDrawer);
  };

  const handelEditarProveedor = (recibido) => {
    console.log("Proveedor a editar:", recibido);
    //setProveedorSeleccionado(recibido);
    setVerModalEditar(!verModalEditar);
  };
  return (
    <>
      <div style={{ textAlign: "left" }}>
        <Button
          type="primary"
          onClick={() => navigator("/admin/sucursal/" + idSucursal)}
        >
          Volver
        </Button>
      </div>

      <Row justify="center" align="middle">
        <Col>
          <Title level={2}>Aprovisionamiento Sucursal {idSucursal}</Title>
        </Col>
      </Row>
      <Divider />

      <Row gutter={16}>
        <Col>
          <Button type="primary" onClick={handleCrearProveedor}>
            Agregar Proveedor
          </Button>
        </Col>
        <Col>
          <Button
            type="default"
            icon={<TeamOutlined />}
            onClick={handleAbrirVendedores}
            disabled={loading || !proveedorSeleccionado}
          >
            Gestionar Vendedores
          </Button>
        </Col>
        <Col>
          {proveedorSeleccionado && (
            <Alert
              message={`Proveedor Seleccionado: ${proveedorSeleccionado.nombre}`}
              type="info"
              showIcon
            />
          )}
        </Col>
      </Row>
      <Divider />

      {/* LISTA DE PROVEEDORES */}
      <Row gutter={[16, 16]}>
        {loading ? (
          <Col span={24} style={{ textAlign: "center", padding: "50px 0" }}>
            <Spin tip="Cargando proveedores..." size="large" fullscreen />
          </Col>
        ) : proveedores.length > 0 ? (
          proveedores.map((proveedor) => (
            <Col key={proveedor.idProveedor} xs={24} sm={12} md={8}>
              <Card
                title={proveedor.nombre}
                hoverable
                extra={
                  <Tag color={proveedor.estado === "Activo" ? "green" : "red"}>
                    {proveedor.estado}
                  </Tag>
                }
                actions={[
                  <EditOutlined
                    key="edit"
                    onClick={() => handelEditarProveedor(proveedor)}
                  />,
                  <Popconfirm
                    title="¿Está seguro de eliminar este proveedor?"
                    onConfirm={() => handleCancel(proveedor.idProveedor)}
                    okText="Sí"
                    cancelText="No"
                  >
                    <DeleteOutlined key="delete" style={{ color: "red" }} />
                  </Popconfirm>,
                ]}
                onClick={() => handleSeleccionarProveedor(proveedor)}
              >
                <p>
                  <strong>RUT:</strong> {proveedor.rut}
                </p>
                <p>
                  <strong>Teléfono:</strong> {proveedor.telefono}
                </p>
                <p>
                  <strong>Email:</strong> {proveedor.email}
                </p>
                <p>
                  <strong>Rubro:</strong> {proveedor.rubro}
                </p>
                <p style={{ fontSize: "12px", color: "#666" }}>
                  <strong>Giro:</strong> {proveedor.giro}
                </p>
                <p>
                  <strong>Fecha Ingreso:</strong>{" "}
                  {new Date(proveedor.fechaIngreso).toLocaleDateString("es-CL")}
                </p>
              </Card>
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Empty description="No hay proveedores registrados" />
          </Col>
        )}
      </Row>

      {/* MODAL CREAR PROVEEDOR */}
      <Modal
        open={verModalCrear}
        onCancel={handleCancel}
        footer={null}
        width={600}
        title="Crear Nuevo Proveedor"
      >
        <Divider />
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitCrear}
          autoComplete="off"
        >
          <Form.Item
            label="RUT"
            name="rut"
            rules={[
              { required: true, message: "Por favor ingrese el RUT" },
              {
                pattern: /^[0-9]+-[0-9kK]{1}$/,
                message: "Formato de RUT inválido (ej: 12345678-9)",
              },
            ]}
          >
            <Input placeholder="12345678-9" />
          </Form.Item>

          <Form.Item
            label="Nombre"
            name="nombre"
            rules={[{ required: true, message: "Por favor ingrese el nombre" }]}
          >
            <Input placeholder="Nombre del proveedor" />
          </Form.Item>

          <Form.Item
            label="Teléfono"
            name="telefono"
            rules={[
              { required: true, message: "Por favor ingrese el teléfono" },
              { pattern: /^[0-9]{9}$/, message: "Debe tener 9 dígitos" },
            ]}
          >
            <Input placeholder="912345678" maxLength={9} />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Por favor ingrese el email" },
              { type: "email", message: "Email inválido" },
            ]}
          >
            <Input placeholder="proveedor@ejemplo.com" />
          </Form.Item>

          <Form.Item
            label="Fecha de Ingreso"
            name="fechaIngreso"
            rules={[
              { required: true, message: "Por favor seleccione la fecha" },
            ]}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            label="Rubro"
            name="rubro"
            rules={[{ required: true, message: "Por favor ingrese el rubro" }]}
          >
            <Input placeholder="Ej: Alimentos, Tecnología, etc." />
          </Form.Item>

          <Form.Item
            label="Giro"
            name="giro"
            rules={[
              { required: true, message: "Por favor seleccione el giro" },
            ]}
          >
            <Select
              placeholder="Seleccione el giro del proveedor"
              showSearch
              virtual={false}
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={girosSII.map((giro) => ({
                value: giro.codigo,
                label: `${giro.codigo} - ${giro.nombre}`,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Estado"
            name="estado"
            rules={[
              { required: true, message: "Por favor seleccione el estado" },
            ]}
            initialValue={proveedorSeleccionado?.estado || "Activo"}
          >
            <Select placeholder="Seleccione el estado">
              <Select.Option value="Activo">Activo</Select.Option>
              <Select.Option value="Inactivo">Inactivo</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Row gutter={8} justify="end">
              <Col>
                <Button onClick={handleCancel}>Cancelar</Button>
              </Col>
              <Col>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Crear Proveedor
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL EDITAR PROVEEDOR */}
      <Modal
        open={verModalEditar}
        onCancel={handelEditarProveedor}
        footer={null}
        width={600}
        title="Editar Proveedor"
      >
        <Divider />
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCancel}
          autoComplete="off"
        >
          <Form.Item
            label="RUT"
            name="rut"
            initialValue={proveedorSeleccionado?.rut}
            rules={[
              { required: true, message: "Por favor ingrese el RUT" },
              {
                pattern: /^[0-9]+-[0-9kK]{1}$/,
                message: "Formato de RUT inválido (ej: 12345678-9)",
              },
            ]}
          >
            <Input placeholder="12345678-9" />
          </Form.Item>

          <Form.Item
            label="Nombre"
            name="nombre"
            initialValue={proveedorSeleccionado?.nombre}
            rules={[{ required: true, message: "Por favor ingrese el nombre" }]}
          >
            <Input placeholder="Nombre del proveedor" />
          </Form.Item>

          <Form.Item
            label="Teléfono"
            name="telefono"
            initialValue={proveedorSeleccionado?.telefono}
            rules={[
              { required: true, message: "Por favor ingrese el teléfono" },
              { pattern: /^[0-9]{9}$/, message: "Debe tener 9 dígitos" },
            ]}
          >
            <Input placeholder="912345678" maxLength={9} />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            initialValue={proveedorSeleccionado?.email}
            rules={[
              { required: true, message: "Por favor ingrese el email" },
              { type: "email", message: "Email inválido" },
            ]}
          >
            <Input placeholder="proveedor@ejemplo.com" />
          </Form.Item>

          <Form.Item
            label="Fecha de Ingreso"
            name="fechaIngreso"
            initialValue={proveedorSeleccionado?.fechaIngreso}
            rules={[
              { required: true, message: "Por favor seleccione la fecha" },
            ]}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            label="Rubro"
            name="rubro"
            initialValue={proveedorSeleccionado?.rubro}
            rules={[{ required: true, message: "Por favor ingrese el rubro" }]}
          >
            <Input placeholder="Ej: Alimentos, Tecnología, etc." />
          </Form.Item>

          <Form.Item
            label="Giro"
            name="giro"
            initialValue={proveedorSeleccionado?.giro}
            rules={[
              { required: true, message: "Por favor seleccione el giro" },
            ]}
          >
            <Select
              placeholder="Seleccione el giro del proveedor"
              showSearch
              virtual={false}
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={girosSII.map((giro) => ({
                value: giro.codigo,
                label: `${giro.codigo} - ${giro.nombre}`,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Estado"
            name="estado"
            initialValue={proveedorSeleccionado?.estado}
            rules={[
              { required: true, message: "Por favor seleccione el estado" },
            ]}
          >
            <Select placeholder="Seleccione el estado">
              <Select.Option value="Activo">Activo</Select.Option>
              <Select.Option value="Inactivo">Inactivo</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Row gutter={8} justify="end">
              <Col>
                <Button onClick={handleCancel}>Cancelar</Button>
              </Col>
              <Col>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Actualizar Proveedor
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Modal>

      {/* DRAWER VENDEDORES */}
      <Drawer
        title="Gestión de Vendedores"
        placement="right"
        onClose={() => setVerDrawerVendedores(false)}
        open={verDrawerVendedores}
        width={500}
      >
        <Button onClick={showChildrenDrawer}>Agregar Nuevo Vendedor</Button>
        {/* DRAWER HIJO CREAR VENDEDOR */}
        <Drawer
          title="Agregar Nuevo Vendedor"
          width={320}
          closable={false}
          onClose={showChildrenDrawer}
          open={childrenDrawer}
        >
          <Form
            form={formVendedor}
            layout="vertical"
            onFinish={handleSubmitVendedor}
            width={400}
            style={{ margin: 10 }}
          >
            <Form.Item
              label="Nombre"
              name="nombre"
              rules={[{ required: true, message: "Ingrese el nombre" }]}
            >
              <Input placeholder="Nombre del vendedor" />
            </Form.Item>
            <Form.Item
              label="Rut"
              name="rut"
              rules={[{ required: true, message: "Ingrese el rut" }]}
            >
              <Input placeholder="12345678-9" />
            </Form.Item>

            <Form.Item
              label="Teléfono"
              name="telefono"
              rules={[
                { required: true, message: "Ingrese el teléfono" },
                { pattern: /^[0-9]{9}$/, message: "Debe tener 9 dígitos" },
              ]}
            >
              <Input placeholder="912345678" maxLength={9} />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Ingrese el email" },
                { type: "email", message: "Email inválido" },
              ]}
            >
              <Input placeholder="vendedor@ejemplo.com" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<UserAddOutlined />}
                block
              >
                Agregar Vendedor
              </Button>
            </Form.Item>
          </Form>
        </Drawer>

        <Divider />

        <Title level={3}>Vendedores Actuales</Title>
        {loading ? (
          <Spin tip="Cargando..." fullscreen />
        ) : vendedores.length > 0 ? (
          <Space direction="vertical" style={{ width: "100%" }}>
            {vendedores.map((vendedor) => (
              <Card
                key={vendedor.idVendedor}
                title={"Vendedor: " + vendedor.nombre}
                size="small"
                extra={
                  <Popconfirm
                    title="¿Eliminar este vendedor?"
                    onConfirm={() => handleCancel(vendedor.idVendedor)}
                    okText="Sí"
                    cancelText="No"
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      size="small"
                    />
                  </Popconfirm>
                }
              >
                <Space
                  direction="vertical"
                  style={{ width: "100%" }}
                  size="small"
                >
                  <div style={{ fontSize: "16px", fontWeight: "bold" }}>
                    <UserOutlined /> {vendedor.nombre}
                  </div>
                  <div style={{ fontSize: "13px" }}>
                    <MailOutlined style={{ color: "#1890ff" }} />{" "}
                    {vendedor.email}
                  </div>
                  <div style={{ fontSize: "13px" }}>
                    <PhoneOutlined style={{ color: "#52c41a" }} />{" "}
                    {vendedor.telefono}
                  </div>
                </Space>
              </Card>
            ))}
          </Space>
        ) : (
          <Empty description="No hay vendedores registrados" />
        )}
      </Drawer>
    </>
  );
  // return (
  //   <>
  //     <div style={{ textAlign: "left" }}>
  //       <Button
  //         type="primary"
  //         onClick={() => navigator("/admin/sucursal/" + idSucursal)}
  //       >
  //         Volver
  //       </Button>
  //     </div>
  //     <Row justify="center" align="middle">
  //       <Col>
  //         <Title level={2}>Aprovisionamiento Sucursal {idSucursal}</Title>
  //       </Col>
  //     </Row>
  //     <Divider />
  //     <Row gutter={16}>
  //       <Col>
  //         <Button type="primary" onClick={() => handelCrearProveedor()}>
  //           Agregar Proveedor
  //         </Button>
  //       </Col>
  //     </Row>
  //     <Row justify="center">
  //       {loading ? (
  //         <Spin tip="Loading" size="large" fullscreen>
  //           Cargando...
  //         </Spin>
  //       ) : proveedores.length > 0 ? (
  //         proveedores.map((proveedor) => (
  //           <Col key={proveedor.idProveedor} span={8} style={{ padding: 8 }}>
  //             <Card
  //               title={proveedor.nombre}
  //               hoverable
  //               extra={
  //                 <Tag color={proveedor.estado === "Activo" ? "green" : "red"}>
  //                   {proveedor.estado}
  //                 </Tag>
  //               }
  //             >
  //               <p>
  //                 <strong>RUT:</strong> {proveedor.rut}
  //               </p>
  //               <p>
  //                 <strong>Teléfono:</strong> {proveedor.telefono}
  //               </p>
  //               <p>
  //                 <strong>Email:</strong> {proveedor.email}
  //               </p>
  //               <p>
  //                 <strong>Rubro:</strong> {proveedor.rubro}
  //               </p>
  //               <p>
  //                 <strong>Giro:</strong> {proveedor.giro}
  //               </p>
  //               <p>
  //                 <strong>Fecha Ingreso:</strong>{" "}
  //                 {new Date(proveedor.fechaIngreso).toLocaleDateString("es-CL")}
  //               </p>
  //             </Card>
  //           </Col>
  //         ))
  //       ) : (
  //         <>
  //           <Empty
  //             description="No hay proveedores registrados"
  //             image={Empty.PRESENTED_IMAGE_SIMPLE}
  //           />
  //         </>
  //       )}
  //     </Row>
  //     <Modal
  //       open={verModalCrear}
  //       onCancel={handleCancel}
  //       footer={null}
  //       width={600}
  //     >
  //       <Title level={4}>Crear Nuevo Proveedor</Title>
  //       <Divider />
  //       <Form
  //         form={form}
  //         layout="vertical"
  //         onFinish={handleSubmit}
  //         autoComplete="off"
  //       >
  //         <Form.Item
  //           label="RUT"
  //           name="rut"
  //           rules={[
  //             { required: true, message: "Por favor ingrese el RUT" },
  //             {
  //               pattern: /^[0-9]+-[0-9kK]{1}$/,
  //               message: "Formato de RUT inválido (ej: 12345678-9)",
  //             },
  //           ]}
  //         >
  //           <Input placeholder="12345678-9" />
  //         </Form.Item>

  //         <Form.Item
  //           label="Nombre"
  //           name="nombre"
  //           rules={[{ required: true, message: "Por favor ingrese el nombre" }]}
  //         >
  //           <Input placeholder="Nombre del proveedor" />
  //         </Form.Item>

  //         <Form.Item
  //           label="Teléfono"
  //           name="telefono"
  //           rules={[
  //             { required: true, message: "Por favor ingrese el teléfono" },
  //             { pattern: /^[0-9]{9}$/, message: "Debe tener 9 dígitos" },
  //           ]}
  //         >
  //           <Input placeholder="912345678" maxLength={9} />
  //         </Form.Item>

  //         <Form.Item
  //           label="Email"
  //           name="email"
  //           rules={[
  //             { required: true, message: "Por favor ingrese el email" },
  //             { type: "email", message: "Email inválido" },
  //           ]}
  //         >
  //           <Input placeholder="proveedor@ejemplo.com" />
  //         </Form.Item>

  //         <Form.Item
  //           label="Fecha de Ingreso"
  //           name="fechaIngreso"
  //           rules={[
  //             { required: true, message: "Por favor seleccione la fecha" },
  //           ]}
  //         >
  //           <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
  //         </Form.Item>

  //         <Form.Item
  //           label="Rubro"
  //           name="rubro"
  //           rules={[{ required: true, message: "Por favor ingrese el rubro" }]}
  //         >
  //           <Input placeholder="Ej: Alimentos, Tecnología, etc." />
  //         </Form.Item>

  //         <Form.Item
  //           label="Giro"
  //           name="giro"
  //           virtual="false"
  //           rules={[
  //             { required: true, message: "Por favor seleccione el giro" },
  //           ]}
  //         >
  //           <Select
  //             placeholder="Seleccione el giro del proveedor"
  //             showSearch
  //             optionFilterProp="children"
  //             filterOption={(input, option) =>
  //               (option?.label ?? "")
  //                 .toLowerCase()
  //                 .includes(input.toLowerCase())
  //             }
  //             options={girosSII.map((giro) => ({
  //               value: giro.codigo,
  //               label: `${giro.codigo} - ${giro.nombre}`,
  //             }))}
  //           />
  //         </Form.Item>

  //         <Form.Item
  //           label="Estado"
  //           name="estado"
  //           rules={[
  //             { required: true, message: "Por favor seleccione el estado" },
  //           ]}
  //           initialValue="Activo"
  //         >
  //           <Select placeholder="Seleccione el estado">
  //             <Select.Option value="Activo">Activo</Select.Option>
  //             <Select.Option value="Inactivo">Inactivo</Select.Option>
  //           </Select>
  //         </Form.Item>

  //         <Form.Item>
  //           <Row gutter={8} justify="end">
  //             <Col>
  //               <Button onClick={handleCancel}>Cancelar</Button>
  //             </Col>
  //             <Col>
  //               <Button type="primary" htmlType="submit" loading={loading}>
  //                 Crear Proveedor
  //               </Button>
  //             </Col>
  //           </Row>
  //         </Form.Item>
  //       </Form>
  //     </Modal>
  //   </>
  // );
}
