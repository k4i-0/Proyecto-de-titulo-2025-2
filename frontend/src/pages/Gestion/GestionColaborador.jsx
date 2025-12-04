import React, { useState, useEffect } from "react";

import { useParams } from "react-router-dom";

import {
  Typography,
  Table,
  Card,
  Row,
  Col,
  Button,
  Drawer,
  notification,
  Spin,
  List,
  Avatar,
  Tag,
  Space,
} from "antd";
const { Title } = Typography;

//importaciones
import obtenerTodosFuncionarios, {
  crearFuncionario,
  obtenerColaboradoresSucursal,
} from "../../services/usuario/funcionario.service.js";

export default function GestionColaborador() {
  const { idSucursal } = useParams();
  const [colaboradores, setColaboradores] = useState([]); // Lista de colaboradores
  const [funcionarios, setFuncionarios] = useState([]); // Lista de funcionarios disponibles para agregar

  //Componentes de estado
  const [loading, setLoading] = useState(false);
  //Drawer Estados
  const [drawerAgregarFuncionario, setDrawerAgregarFuncionario] =
    useState(false);

  //Funciones para obtener datos (colaboradores y funcionarios)

  const obtenerFuncionarios = async () => {
    try {
      setLoading(true);
      const respuesta = await obtenerTodosFuncionarios();
      if (respuesta.status === 200) {
        console.log("Funcionarios obtenidos:", respuesta.data);
        setFuncionarios(respuesta.data);
        notification.success({
          message: "Éxito",
          description: "Funcionarios obtenidos correctamente.",
          placement: "topRight",
        });
        setLoading(false);
        return;
      }
      if (respuesta.status === 204) {
        setFuncionarios([]);
        notification.info({
          message: "Información",
          description: "No hay funcionarios disponibles para mostrar.",
          placement: "topRight",
        });
        setLoading(false);
        return;
      }
      notification.error({
        message: "Error",
        description: respuesta.error || "Error al obtener los funcionarios.",
        placement: "topRight",
      });
    } catch (error) {
      console.error("Error al obtener los funcionarios:", error);
      notification.error({
        message: "Error",
        description: error.message || "Error al obtener los funcionarios.",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const crearContratoFuncionario = async (datos) => {
    try {
      setLoading(true);
      const respuesta = await crearFuncionario(datos);
      if (respuesta.status === 200) {
        notification.success({
          message: "Éxito",
          description: "Funcionario creado correctamente.",
          placement: "topRight",
        });
        setLoading(false);
        return;
      }
      if (respuesta.status === 422) {
        notification.warning({
          message: "Advertencia",
          description:
            respuesta.error || "Datos incompletos para crear el funcionario.",
          placement: "topRight",
        });
        setLoading(false);
        return;
      }
      if (respuesta.status === 409) {
        notification.warning({
          message: "Advertencia",
          description:
            respuesta.error ||
            "El funcionario ya existe y no se puede crear duplicado.",
          placement: "topRight",
        });
        setLoading(false);
        return;
      }
      notification.error({
        message: "Error",
        description: respuesta.error || "Error al crear el funcionario.",
        placement: "topRight",
      });
    } catch (error) {
      console.error("Error al crear el funcionario:", error);
      notification.error({
        message: "Error",
        description: error.message || "Error al crear el funcionario.",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const obtenerColaboradores = async (idSucursal) => {
    try {
      setLoading(true);
      const respuesta = await obtenerColaboradoresSucursal(idSucursal);
      if (respuesta.status === 200) {
        console.log("Colaboradores obtenidos:", respuesta.data);
        notification.success({
          message: "Éxito",
          description: "Colaboradores obtenidos correctamente.",
          placement: "topRight",
        });
        setColaboradores(respuesta.data);
        setLoading(false);
        return;
      }
      if (respuesta.status === 204) {
        notification.info({
          message: "Información",
          description: "No hay colaboradores registrados para esta sucursal.",
          placement: "topRight",
        });
        setColaboradores([]);
        setLoading(false);
        return;
      }
      if (respuesta.status === 422) {
        notification.warning({
          message: "Advertencia",
          description: respuesta.error || "Falta el ID de la sucursal.",
          placement: "topRight",
        });
        setLoading(false);
        return;
      }
      notification.error({
        message: "Error",
        description: respuesta.error || "Error al obtener los colaboradores.",
        placement: "topRight",
      });
    } catch (error) {
      console.error("Error al obtener los colaboradores:", error);
      notification.error({
        message: "Error",
        description: error.message || "Error al obtener los colaboradores.",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerColaboradores(idSucursal);
  }, [idSucursal]);

  //Funciones para manejar acciones
  const handleOpenDrawerAgregarFuncionario = async () => {
    await obtenerFuncionarios();
    setDrawerAgregarFuncionario(true);
  };

  const handleCloseDrawerAgregarFuncionario = () => {
    setDrawerAgregarFuncionario(false);
  };

  const handleAgregarFuncionario = async (funcionario) => {
    const datosContrato = {
      idSucursal: idSucursal,
      idFuncionario: funcionario.idFuncionario,
    };
    await crearContratoFuncionario(datosContrato);
    setDrawerAgregarFuncionario(false);
    await obtenerColaboradores(idSucursal);
  };

  const columns = [
    {
      title: "Nombre",
      dataIndex: ["funcionario", "nombre"],
      key: "nombre",
    },

    {
      title: "RUT",
      dataIndex: ["funcionario", "rut"],
      key: "rut",
    },
    {
      title: "Cargo",
      dataIndex: ["funcionario", "role", "nombreRol"],
      key: "cargo",
    },
    {
      title: "Tipo Contrato",
      dataIndex: "tipoContrato",
      key: "tipoContrato",
    },
    {
      title: "Fecha Ingreso",
      dataIndex: "fechaIngreso",
      key: "fechaIngreso",
      render: (fecha) => new Date(fecha).toLocaleDateString("es-CL"),
    },
    {
      title: "Fecha Término",
      dataIndex: "fechaTermino",
      key: "fechaTermino",
      render: (fecha) => new Date(fecha).toLocaleDateString("es-CL"),
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (estado) => (
        <Tag color={estado === "Activo" ? "green" : "red"}>{estado}</Tag>
      ),
    },
    {
      title: "Acciones",
      key: "acciones",
      render: () => (
        <Space>
          <Button type="primary" size="small">
            Ver
          </Button>
          <Button danger size="small">
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Spin spinning={loading} size="large" tip="Cargando..." fullscreen />
      <Title level={2}>Gestión de Colaboradores</Title>
      <Card
        style={{ marginBottom: 20 }}
        title={`Colaboradores sucursal ${idSucursal}`}
      >
        <Row gutter={16} justify="end" style={{ marginBottom: 16 }}>
          <Col>
            <Button onClick={handleOpenDrawerAgregarFuncionario}>
              Agregar Funcionario
            </Button>
          </Col>
          <Col>
            <Button>Ver Funcionarios</Button>
          </Col>
        </Row>
        <Table
          dataSource={colaboradores}
          columns={columns}
          scroll={{ x: 600 }}
          rowKey="idContratoFuncionario"
        />
      </Card>

      {/* Drawer para agregar funcionarios */}
      <Drawer
        title="Agregar Funcionario"
        width={500}
        onClose={handleCloseDrawerAgregarFuncionario}
        open={drawerAgregarFuncionario}
      >
        {funcionarios.length === 0 ? (
          <p>No hay funcionarios disponibles para agregar.</p>
        ) : (
          <>
            {/* {funcionarios.map((funcionario) => (
              <Card
                key={funcionario.idFuncionario}
                type="inner"
                title={`Nombre: ${funcionario.nombre} ${funcionario.apellido}`}
                width="100%"
                style={{ marginBottom: 16 }}
              > */}
            <List
              dataSource={funcionarios}
              renderItem={(funcionario) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar>{funcionario.nombre[0]}</Avatar>}
                    title={funcionario.nombre}
                    description={`${funcionario.rut || "Sin RUT"} - ${
                      funcionario.role?.nombreRol || "Sin rol"
                    }`}
                  />
                  <Button onClick={() => handleAgregarFuncionario(funcionario)}>
                    Agregar
                  </Button>
                </List.Item>
              )}
            />

            {/* </Card> */}
            {/* ))} */}
          </>
        )}
      </Drawer>
    </>
  );
}
