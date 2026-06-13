import React, { useState, useEffect, useMemo, Children } from "react";
import {
  Button,
  Space,
  Tag,
  Drawer,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  Avatar,
  Card,
  Row,
  Col,
  Statistic,
  Modal,
  Descriptions,
  Badge,
  Divider,
  Popconfirm,
  Tooltip,
  Typography,
  notification,
  Tabs,
  Switch,
  Table,
} from "antd";
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  UserOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  IdcardOutlined,
  CalendarOutlined,
  FileTextOutlined,
  FileAddOutlined,
  NotificationFilled,
  ReloadOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

import JsBarcode from "jsbarcode";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option, OptGroup } = Select;

const comunasPorRegion = [
  {
    label: "Arica y Parinacota",
    options: ["Arica", "Camarones", "Putre", "General Lagos"],
  },
  {
    label: "Tarapacá",
    options: [
      "Iquique",
      "Alto Hospicio",
      "Pozo Almonte",
      "Camiña",
      "Colchane",
      "Huara",
      "Pica",
    ],
  },
  {
    label: "Antofagasta",
    options: [
      "Antofagasta",
      "Mejillones",
      "Sierra Gorda",
      "Taltal",
      "Calama",
      "Ollagüe",
      "San Pedro de Atacama",
      "Tocopilla",
      "María Elena",
    ],
  },
  {
    label: "Atacama",
    options: [
      "Copiapó",
      "Caldera",
      "Tierra Amarilla",
      "Chañaral",
      "Diego de Almagro",
      "Vallenar",
      "Alto del Carmen",
      "Freirina",
      "Huasco",
    ],
  },
  {
    label: "Coquimbo",
    options: [
      "La Serena",
      "Coquimbo",
      "Andacollo",
      "La Higuera",
      "Paihuano",
      "Vicuña",
      "Illapel",
      "Canela",
      "Los Vilos",
      "Salamanca",
      "Ovalle",
      "Combarbalá",
      "Monte Patria",
      "Punitaqui",
      "Río Hurtado",
    ],
  },
  {
    label: "Valparaíso",
    options: [
      "Valparaíso",
      "Casablanca",
      "Concón",
      "Juan Fernández",
      "Puchuncaví",
      "Quintero",
      "Viña del Mar",
      "Isla de Pascua",
      "Los Andes",
      "Calle Larga",
      "Rinconada",
      "San Esteban",
      "La Ligua",
      "Cabildo",
      "Papudo",
      "Petorca",
      "Zapallar",
      "Quillota",
      "Calera",
      "Hijuelas",
      "La Cruz",
      "Nogales",
      "San Antonio",
      "Algarrobo",
      "Cartagena",
      "El Quisco",
      "El Tabo",
      "Santo Domingo",
      "San Felipe",
      "Catemu",
      "Llaillay",
      "Panquehue",
      "Putaendo",
      "Santa María",
      "Quilpué",
      "Limache",
      "Olmué",
      "Villa Alemana",
    ],
  },
  {
    label: "Metropolitana de Santiago",
    options: [
      "Santiago",
      "Cerrillos",
      "Cerro Navia",
      "Conchalí",
      "El Bosque",
      "Estación Central",
      "Huechuraba",
      "Independencia",
      "La Cisterna",
      "La Florida",
      "La Granja",
      "La Pintana",
      "La Reina",
      "Las Condes",
      "Lo Barnechea",
      "Lo Espejo",
      "Lo Prado",
      "Macul",
      "Maipú",
      "Ñuñoa",
      "Pedro Aguirre Cerda",
      "Peñalolén",
      "Providencia",
      "Pudahuel",
      "Quilicura",
      "Quinta Normal",
      "Recoleta",
      "Renca",
      "San Joaquín",
      "San Miguel",
      "San Ramón",
      "Vitacura",
      "Puente Alto",
      "Pirque",
      "San José de Maipo",
      "Colina",
      "Lampa",
      "Tiltil",
      "San Bernardo",
      "Buin",
      "Calera de Tango",
      "Paine",
      "Melipilla",
      "Alhué",
      "Curacaví",
      "María Pinto",
      "San Pedro",
      "Talagante",
      "El Monte",
      "Isla de Maipo",
      "Padre Hurtado",
      "Peñaflor",
    ],
  },
  {
    label: "O'Higgins",
    options: [
      "Rancagua",
      "Codegua",
      "Coinco",
      "Coltauco",
      "Doñihue",
      "Graneros",
      "Las Cabras",
      "Machalí",
      "Malloa",
      "Mostazal",
      "Olivar",
      "Peumo",
      "Pichidegua",
      "Quinta de Tilcoco",
      "Rengo",
      "Requínoa",
      "San Vicente",
      "Pichilemu",
      "La Estrella",
      "Litueche",
      "Marchihue",
      "Navidad",
      "Paredones",
      "San Fernando",
      "Chépica",
      "Chimbarongo",
      "Lolol",
      "Nancagua",
      "Palmilla",
      "Peralillo",
      "Placilla",
      "Pumanque",
      "Santa Cruz",
    ],
  },
  {
    label: "Maule",
    options: [
      "Talca",
      "Constitución",
      "Curepto",
      "Empedrado",
      "Maule",
      "Pelarco",
      "Pencahue",
      "Río Claro",
      "San Clemente",
      "Cauquenes",
      "Chanco",
      "Pelluhue",
      "Curicó",
      "Hualañé",
      "Licantén",
      "Molina",
      "Rauco",
      "Romeral",
      "Sagrada Familia",
      "Teno",
      "Vichuquén",
      "Linares",
      "Colbún",
      "Longaví",
      "Parral",
      "Retiro",
      "San Javier",
      "Villa Alegre",
      "Yerbas Buenas",
    ],
  },
  {
    label: "Ñuble",
    options: [
      "Chillán",
      "Chillán Viejo",
      "Bulnes",
      "Cobquecura",
      "Coelemu",
      "Coihueco",
      "El Carmen",
      "Ninhue",
      "Ñiquén",
      "Pemuco",
      "Pinto",
      "Portezuelo",
      "Quillón",
      "Quirihue",
      "Ránquil",
      "San Carlos",
      "San Fabián",
      "San Ignacio",
      "San Nicolás",
      "Treguaco",
      "Yungay",
    ],
  },
  {
    label: "Biobío",
    options: [
      "Concepción",
      "Coronel",
      "Chiguayante",
      "Florida",
      "Hualpén",
      "Hualqui",
      "Lota",
      "Penco",
      "San Pedro de la Paz",
      "Santa Juana",
      "Talcahuano",
      "Tomé",
      "Lebu",
      "Arauco",
      "Cañete",
      "Contulmo",
      "Curanilahue",
      "Los Álamos",
      "Tirúa",
      "Los Ángeles",
      "Antuco",
      "Cabrero",
      "Laja",
      "Mulchén",
      "Nacimiento",
      "Negrete",
      "Quilaco",
      "Quilleco",
      "San Rosendo",
      "Santa Bárbara",
      "Tucapel",
      "Yumbel",
      "Alto Biobío",
    ],
  },
  {
    label: "La Araucanía",
    options: [
      "Temuco",
      "Carahue",
      "Cunco",
      "Curarrehue",
      "Freire",
      "Galvarino",
      "Gorbea",
      "Lautaro",
      "Loncoche",
      "Melipeuco",
      "Nueva Imperial",
      "Padre Las Casas",
      "Perquenco",
      "Pitrufquén",
      "Pucón",
      "Saavedra",
      "Teodoro Schmidt",
      "Toltén",
      "Vilcún",
      "Villarrica",
      "Cholchol",
      "Angol",
      "Collipulli",
      "Curacautín",
      "Ercilla",
      "Lonquimay",
      "Los Sauces",
      "Lumaco",
      "Purén",
      "Renaico",
      "Traiguén",
      "Victoria",
    ],
  },
  {
    label: "Los Ríos",
    options: [
      "Valdivia",
      "Corral",
      "Lanco",
      "Los Lagos",
      "Máfil",
      "Mariquina",
      "Paillaco",
      "Panguipulli",
      "La Unión",
      "Futrono",
      "Lago Ranco",
      "Río Bueno",
    ],
  },
  {
    label: "Los Lagos",
    options: [
      "Puerto Montt",
      "Calbuco",
      "Cochamó",
      "Fresia",
      "Frutillar",
      "Llanquihue",
      "Los Muermos",
      "Maullín",
      "Puerto Varas",
      "Castro",
      "Ancud",
      "Chonchi",
      "Curaco de Vélez",
      "Dalcahue",
      "Puqueldón",
      "Queilén",
      "Quellón",
      "Quemchi",
      "Quinchao",
      "Osorno",
      "Puerto Octay",
      "Purranque",
      "Puyehue",
      "Río Negro",
      "San Juan de la Costa",
      "San Pablo",
      "Chaitén",
      "Futaleufú",
      "Hualaihué",
      "Palena",
    ],
  },
  {
    label: "Aysén",
    options: [
      "Coyhaique",
      "Lago Verde",
      "Aysén",
      "Cisnes",
      "Guaitecas",
      "Cochrane",
      "O'Higgins",
      "Tortel",
      "Chile Chico",
      "Río Ibáñez",
    ],
  },
  {
    label: "Magallanes y de la Antártica Chilena",
    options: [
      "Punta Arenas",
      "Laguna Blanca",
      "Río Verde",
      "San Gregorio",
      "Cabo de Hornos",
      "Antártica",
      "Porvenir",
      "Primavera",
      "Timaukel",
      "Natales",
      "Torres del Paine.",
    ],
  },
];

import DataTable from "../../../components/Tabla";

import obtenerTodosFuncionarios, {
  crearFuncionario,
  editarFuncionario,
  eliminarFuncionario,
  obtenerContratosFuncionarios,
  //obtenerFuncionariosSinContrato,
  //asignarContratoAFuncionarioSinContrato,
  cambiarTurnoFuncionario,
  cambiarTipoContratoFuncionario,
  reasignarSucursalFuncionario,
  obtenerHistorialContratosDelFuncionario,
  actualizarClavesFuncionario,
  actualizarPrivilegiosFuncionario,
  obtenerTodosRoles,
  crearRol,
  editarRol,
  eliminarRol,
} from "../../../services/usuario/funcionario.service";
import obtenerSucursales from "../../../services/inventario/Sucursal.service";

const GestionColaborador = () => {
  const [form] = Form.useForm();

  //const [formContrato] = Form.useForm();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [detalleTabKey, setDetalleTabKey] = useState("resumen");
  const [editMode, setEditMode] = useState(false);
  const [selectedColaborador, setSelectedColaborador] = useState(null);
  const [loading, setLoading] = useState(false);
  const [colaboradores, setColaboradores] = useState([]);

  const [contratos, setContratos] = useState([]);
  const [roles, setRoles] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [sucursalPermisosSeleccionada, setSucursalPermisosSeleccionada] =
    useState(undefined);
  const [modalPermisosVisible, setModalPermisosVisible] = useState(false);
  const [funcionarioPermisosSeleccionado, setFuncionarioPermisosSeleccionado] =
    useState(null);

  const [modalContratoVisible, setModalContratoVisible] = useState(false);
  const [contratoSeleccionado, setContratoSeleccionado] = useState(null);

  //const [modalCrearContrato, setModalCrearContrato] = useState(false);
  //const [funcionariosSinContrato, setFuncionariosSinContrato] = useState([]);
  const [modalEditarTurnoVisible, setModalEditarTurnoVisible] = useState(false);
  const [contratoTurnoEditando, setContratoTurnoEditando] = useState(null);
  const [modalEditarContratoVisible, setModalEditarContratoVisible] =
    useState(false);
  const [funcionarioBuscado, setFuncionarioBuscado] = useState(null);
  const [historialContratos, setHistorialContratos] = useState([]);
  const [modalRolVisible, setModalRolVisible] = useState(false);
  const [rolEditando, setRolEditando] = useState(null);

  // Instancias para manejar los formularios de Ant Design
  const [formClaves] = Form.useForm();
  const [formPermisos] = Form.useForm();
  const [formRol] = Form.useForm();
  const [formEditarTurno] = Form.useForm();
  const [formEditarContrato] = Form.useForm();
  const [formReasignacion] = Form.useForm();

  // Diccionario para mostrar nombres amigables en los Switches
  const etiquetasPermisos = {
    administrarUsuarios: "Administrar Usuarios",
    gestionarSucursales: "Gestionar Sucursales",
    gestionarProductos: "Gestionar Productos",
    gestionarCategorias: "Gestionar Categorías",
    gestionarProveedores: "Gestionar Proveedores",
    gestionColaboradores: "Gestionar Colaboradores",
    gestionarInventario: "Gestionar Inventario",
    gestionarOrdenesCompra: "Gestionar Órdenes de Compra",
    gestionarDespachos: "Gestionar Despachos",
    gestionarBodega: "Gestionar Bodega",
    gestionarDescuentos: "Gestionar Descuentos",
    accesoCaja: "Acceso a Caja",
  };

  // Efecto para cargar los permisos en el formulario cuando se abre el modal
  useEffect(() => {
    if (funcionarioPermisosSeleccionado?.privilegios) {
      formPermisos.setFieldsValue(funcionarioPermisosSeleccionado.privilegios);
    }
  }, [funcionarioPermisosSeleccionado, formPermisos]);

  const contratosDelColaborador = useMemo(() => {
    if (!selectedColaborador) {
      return [];
    }

    return contratos.filter((contrato) => {
      const funcionarioContrato = contrato?.funcionario;
      return (
        funcionarioContrato?.rut === selectedColaborador?.rut ||
        funcionarioContrato?.idFuncionario === selectedColaborador?.id ||
        (funcionarioContrato?.nombre === selectedColaborador?.nombre &&
          funcionarioContrato?.apellido === selectedColaborador?.apellido)
      );
    });
  }, [contratos, selectedColaborador]);

  const contratoActivoColaborador = useMemo(() => {
    return (
      contratosDelColaborador.find(
        (contrato) => contrato.estado === "Activo",
      ) ||
      contratosDelColaborador[0] ||
      null
    );
  }, [contratosDelColaborador]);

  const sucursalSeleccionadaPermisosNombre = useMemo(() => {
    if (!sucursalPermisosSeleccionada) {
      return "";
    }

    return (
      sucursales.find(
        (sucursal) =>
          String(sucursal.idSucursal) === String(sucursalPermisosSeleccionada),
      )?.nombre || ""
    );
  }, [sucursales, sucursalPermisosSeleccionada]);

  const funcionariosPorSucursalPermisos = useMemo(() => {
    if (!sucursalPermisosSeleccionada) {
      return [];
    }

    const normalizar = (valor) =>
      String(valor || "")
        .trim()
        .toLowerCase();

    const sucursalSeleccionadaNormalizada = normalizar(
      sucursalSeleccionadaPermisosNombre,
    );

    return colaboradores
      .filter((colaborador) => {
        const sucursalFuncionarioId = normalizar(colaborador?.idSucursal);
        const sucursalFuncionarioNombre = normalizar(
          colaborador?.sucursal?.nombre ||
            colaborador?.sucursalNombre ||
            colaborador?.sucursal,
        );

        return (
          sucursalFuncionarioId === normalizar(sucursalPermisosSeleccionada) ||
          sucursalFuncionarioNombre === sucursalSeleccionadaNormalizada
        );
      })
      .map((colaborador) => ({
        ...colaborador,
        sucursalNombre:
          colaborador?.sucursal?.nombre ||
          colaborador?.sucursalNombre ||
          colaborador?.sucursal ||
          sucursalSeleccionadaPermisosNombre ||
          "Casa Matriz",
      }));
  }, [
    colaboradores,
    sucursalPermisosSeleccionada,
    sucursalSeleccionadaPermisosNombre,
  ]);

  // const formatearCodigoAcceso = (rut = "") => {
  //   const cuerpoRut = String(rut).split("-")[0];
  //   if (!cuerpoRut) {
  //     return "-";
  //   }

  //   return cuerpoRut.slice(-4).padStart(4, "0");
  // };

  // const obtenerPermisosActivos = (privilegios = {}) => {
  //   if (!privilegios || typeof privilegios !== "object") {
  //     return [];
  //   }

  //   return Object.entries(privilegios)
  //     .filter(([, habilitado]) => Boolean(habilitado))
  //     .map(([clave]) => clave);
  // };

  const abrirModalPermisos = (funcionario) => {
    setFuncionarioPermisosSeleccionado(funcionario);
    setModalPermisosVisible(true);
  };

  const cerrarModalPermisos = () => {
    setModalPermisosVisible(false);
    setFuncionarioPermisosSeleccionado(null);
  };

  const generarSVGBarcode = (codigo = "") => {
    try {
      const canvas = document.createElement("canvas");
      JsBarcode(canvas, String(codigo), {
        format: "CODE128",
        width: 1,
        height: 50,
        displayValue: false,
        margin: 10,
      });
      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Error generando barcode:", error);
      return null;
    }
  };

  const imprimirCodigoAcceso = () => {
    if (!funcionarioPermisosSeleccionado) return;

    const codigoAcceso = funcionarioPermisosSeleccionado.codigoAcceso;

    // EAN13 necesita 12 dígitos + 1 verificador, padStart para rellenar
    const codigoCode128 = String(codigoAcceso).trim();
    const imagenBarcode = generarSVGBarcode(codigoCode128);
    if (!imagenBarcode) {
      notification.error({ message: "Error al generar código de barras" });
      return;
    }

    const ventana = window.open("", "_blank", "width=520,height=360");
    if (!ventana) {
      notification.error({
        message: "No se pudo abrir la ventana de impresión",
      });
      return;
    }

    ventana.document.write(`
  <html>
    <head>
      <title>Código de acceso</title>
      <style>
        @page {
          size: 10cm 10cm;
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
          width: 10cm;
          height: 10cm;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          font-family: Arial, sans-serif;
        }
        .card {
          width: 10cm;
          height: 10cm;
          box-sizing: border-box;
          padding: 2mm;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
        }
        .nombre {
          font-size: 6px;
          font-weight: bold;
          text-align: center;
          margin: 0;
        }
        .rut {
          font-size: 5px;
          color: #555;
          text-align: center;
          margin: 0;
        }
        .cargo {
          font-size: 5px;
          color: #888;
          text-align: center;
          margin: 0;
        }
        img { max-width: 100%; }
      </style>
    </head>
    <body>
      <div class="card">
        <p class="nombre">${funcionarioPermisosSeleccionado.nombre} ${funcionarioPermisosSeleccionado.apellido}</p>
        <p class="rut">${funcionarioPermisosSeleccionado.rut}</p>
        <p class="cargo">${funcionarioPermisosSeleccionado.cargo || ""}</p>
        <img src="${imagenBarcode}" />
      </div>
    </body>
  </html>
`);
    ventana.document.close();
    ventana.focus();
    ventana.print();
    ventana.close();
  };

  //obtener sucursales
  useEffect(() => {
    const todasSucursales = async () => {
      try {
        setLoading(true);
        const response = await obtenerSucursales();
        console.log("respuesta sucursales", response);
        if (response.status === 200) {
          setSucursales(response.data);
          setLoading(false);
          notification.success({
            message: "Sucursales cargadas",
            description: "Las sucursales se han cargado correctamente.",
            duration: 2,
          });
          return;
        }
        if (response.status === 204) {
          setSucursales([]);
          setLoading(false);
          notification.info({
            message: "No hay sucursales",
            description: "No se encontraron sucursales registradas.",
            duration: 2,
          });
          return;
        }
        notification.error({
          message: response.error || "Error al cargar sucursales",
          description: "Hubo un problema al obtener las sucursales.",
          duration: 5,
        });
      } catch (error) {
        notification.error({
          message: error.message || "Error de servidor",
          description: "No se pudo conectar al servidor.",
          duration: 5,
        });
      } finally {
        setLoading(false);
      }
    };
    todasSucursales();
  }, []);

  //obtener colaboradores
  const obtenerColaboradores = async () => {
    setLoading(true);
    try {
      const response = await obtenerTodosFuncionarios();
      console.log("Respuesta colaboradores:", response.data);
      if (response.status === 200) {
        setColaboradores(response.data);
        setLoading(false);
        notification.success({
          message: "Colaboradores cargados",
          description: "Los colaboradores se han cargado correctamente.",
          duration: 3,
        });
        return;
      }
      if (response.status === 204) {
        setColaboradores([]);
        setLoading(false);
        notification.info({
          message: "No hay colaboradores",
          description: "No se encontraron colaboradores registrados.",
          duration: 3,
        });
        return;
      }
      notification.error({
        message: response.error || "Error al cargar colaboradores",
        description: "Hubo un problema al obtener los colaboradores.",
        duration: 5,
      });
    } catch (error) {
      notification.error({
        message: error.message || "Error de servidor",
        description: "No se pudo conectar al servidor.",
        duration: 5,
      });
    } finally {
      setLoading(false);
    }
  };
  const cargarRoles = async () => {
    try {
      const respuesta = await obtenerTodosRoles();
      console.log("respuesta roles", respuesta.data);
      if (respuesta.status === 200) {
        setRoles(respuesta.data);
        return;
      }
      notification.error({
        message: respuesta.error || "Error al cargar roles",
        description: "Hubo un problema al obtener los roles.",
        duration: 5,
      });
    } catch (error) {
      console.log(error);
      notification.error({
        message: error.message || "Error de servidor",
        description: "No se pudo conectar al servidor.",
        duration: 5,
      });
    }
  };
  useEffect(() => {
    obtenerColaboradores();
    obtenerContratos();
    cargarRoles();
  }, []);

  //obtener contratos
  const obtenerContratos = async () => {
    try {
      const respuesta = await obtenerContratosFuncionarios();
      //console.log("respuesta de contratos funcionario", respuesta.data);
      if (respuesta.status === 200) {
        setContratos(respuesta.data);
        return;
      }
      notification.error({
        message: respuesta.error || "Error al cargar contratos",
        description: "Hubo un problema al obtener los contratos.",
      });
    } catch (error) {
      console.log(error);
      notification.error({
        message: error.message || "Error de servidor",
        description: "No se pudo conectar al servidor.",
        duration: 5,
      });
    }
  };

  //historial de contratos
  const cargarHistorial = async (idFuncionario) => {
    try {
      const respuesta =
        await obtenerHistorialContratosDelFuncionario(idFuncionario);
      if (respuesta.status === 200) {
        setHistorialContratos(respuesta.data);
        return;
      }
      setHistorialContratos([]);
    } catch (error) {
      console.log(error);
    }
  };

  //columnas de contratos
  // const columnasContratos = [
  //   {
  //     title: "Colaborador",
  //     key: "colaborador",
  //     width: 200,
  //     render: (_, record) => {
  //       const nombre = record?.funcionario?.nombre || "N";
  //       const apellido = record?.funcionario?.apellido || "A";

  //       return (
  //         <Space key={`colaborador-contrato-${record?.idContratoFuncionario}`}>
  //           <Avatar
  //             key="avatar"
  //             size={40}
  //             icon={<UserOutlined />}
  //             style={{ backgroundColor: "#1890ff" }}
  //           >
  //             {nombre.charAt(0).toUpperCase()}
  //             {apellido.charAt(0).toUpperCase()}
  //           </Avatar>
  //           <div key="info">
  //             <div style={{ fontWeight: 500 }}>
  //               {nombre} {apellido}
  //             </div>
  //             <div style={{ fontSize: "12px", color: "#999" }}>
  //               {record?.funcionario?.rut || "S/R"}
  //             </div>
  //           </div>
  //         </Space>
  //       );
  //     },
  //   },
  //   {
  //     title: "Sucursal",
  //     dataIndex: ["sucursal", "nombre"],
  //     key: "sucursal",
  //     width: 120,
  //     render: (sucursal) => (
  //       <Tag color="green">{sucursal || "Casa Matriz"}</Tag>
  //     ),
  //   },
  //   {
  //     title: "Tipo de Contrato",
  //     dataIndex: "tipoContrato",
  //     key: "tipoContrato",
  //     width: 120,
  //     render: (tipoContrato) => {
  //       const colors = {
  //         Indefinido: "blue",
  //         "Plazo Fijo": "orange",
  //         Honorarios: "purple",
  //       };
  //       return (
  //         <Tag color={colors[tipoContrato] || "default"}>
  //           {tipoContrato || "No asignado"}
  //         </Tag>
  //       );
  //     },
  //   },
  //   {
  //     title: "Turno",
  //     dataIndex: "turno",
  //     key: "turno",
  //     width: 100,
  //     render: (turno) => {
  //       const colors = {
  //         Mañana: "blue",
  //         Tarde: "orange",
  //         Noche: "purple",
  //         Rotativo: "green",
  //       };
  //       return (
  //         <Tag color={colors[turno] || "default"}>{turno || "No asignado"}</Tag>
  //       );
  //     },
  //   },
  //   {
  //     title: "Fecha de Ingreso",
  //     dataIndex: "fechaIngreso",
  //     key: "fechaIngreso",
  //     width: 120,
  //     render: (fechaIngreso) =>
  //       fechaIngreso ? dayjs(fechaIngreso).format("DD/MM/YYYY") : "N/A",
  //   },
  //   {
  //     title: "Estado",
  //     dataIndex: "estado",
  //     key: "estado",
  //     width: 110,
  //     render: (estado) => (
  //       <Badge
  //         status={estado === "Activo" ? "success" : "error"}
  //         text={estado || "Desconocido"}
  //       />
  //     ),
  //   },
  //   {
  //     title: "Acciones",
  //     key: "acciones",
  //     width: 80,
  //     fixed: "right",
  //     render: (_, record) => (
  //       <Space key={`acciones-contrato-${record.idContratoFuncionario}`}>
  //         <Tooltip key="view" title="Ver Detalles">
  //           <Button
  //             type="link"
  //             icon={<EyeOutlined />}
  //             onClick={() => abrirModalContrato(record)}
  //           />
  //         </Tooltip>
  //         <Tooltip key="edit-turno" title="Editar turno">
  //           <Button
  //             type="link"
  //             icon={<EditOutlined />}
  //             onClick={() => abrirModalEditarTurno(record)}
  //           />
  //         </Tooltip>
  //       </Space>
  //     ),
  //   },
  // ];

  //obtener funcionarios sin contrato para el select del formulario de contrato
  // const obtenerFuncionarioSC = async () => {
  //   try {
  //     const respuesta = await obtenerFuncionariosSinContrato();
  //     console.log("respuesta funcionarios sin contrato", respuesta.data);
  //     if (respuesta.status === 200) {
  //       setFuncionariosSinContrato(respuesta.data);
  //       return;
  //     }
  //     if (respuesta.status === 204) {
  //       setFuncionariosSinContrato([]);
  //       notification.info({
  //         message: "No hay funcionarios sin contrato",
  //         description:
  //           "Todos los funcionarios activos tienen contrato asignado.",
  //       });
  //     }
  //     notification.error({
  //       message: respuesta.error || "Error al cargar funcionarios sin contrato",
  //       description:
  //         "Hubo un problema al obtener los funcionarios sin contrato.",
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     notification.error({
  //       message: error.message || "Error de servidor",
  //       description: "No se pudo conectar al servidor.",
  //     });
  //   }
  // };

  // const abrirModalContrato = (record) => {
  //   setContratoSeleccionado(record);
  //   setModalContratoVisible(true);
  // };

  // const abrirModalEditarTurno = (record) => {
  //   setContratoTurnoEditando(record);
  //   formEditarTurno.setFieldsValue({
  //     idContratoFuncionario: record.idContratoFuncionario,
  //     turno: record?.turno,
  //   });
  //   setModalEditarTurnoVisible(true);
  // };

  const cerrarModalContrato = () => {
    setContratoSeleccionado(null);
    setModalContratoVisible(false);
  };

  const cerrarModalEditarTurno = () => {
    setContratoTurnoEditando(null);
    setModalEditarTurnoVisible(false);
    formEditarTurno.resetFields();
  };

  const handleSubmitEditarTurno = async (values) => {
    console.log("Datos en Enviar cambio turno", values);
    try {
      const respuesta = await cambiarTurnoFuncionario(values);
      console.log("Respuesta del cambio de turno", respuesta);
      if (respuesta.status === 200) {
        notification.success({
          message: respuesta.data.message || "Turno actualizado",
        });
        formEditarTurno.resetFields();
        cerrarModalEditarTurno();
        obtenerContratos();
        obtenerColaboradores();
        return;
      }
      notification.error({
        message: respuesta.error || "Error al actualizar turno",
      });
    } catch (error) {
      console.log(error);
      notification.error({
        message: error.message || "Error de servidor",
        description: "No se pudo conectar al servidor.",
      });
    } finally {
      cerrarModalEditarTurno();
    }
  };

  const cerrarModalEditarContrato = () => {
    setFuncionarioBuscado(null);
    setModalEditarContratoVisible(false);
    formEditarContrato.resetFields();
  };

  const formatearRutNumerico = (value = "") => {
    const soloDigitos = String(value).replace(/\D/g, "").slice(0, 9);
    if (soloDigitos.length <= 1) {
      return soloDigitos;
    }
    const cuerpo = soloDigitos.slice(0, -1);
    const dv = soloDigitos.slice(-1);
    return `${cuerpo}-${dv}`;
  };

  const handleBuscarFuncionarioPorRut = (rut) => {
    const rutFormateado = formatearRutNumerico(rut);

    if (!rutFormateado) {
      notification.error({ message: "Ingrese RUT para buscar" });
      return;
    }
    const encontrado = colaboradores.find((c) => c.rut === rutFormateado);
    //|| funcionariosSinContrato.find((f) => f.rut === rutFormateado);
    if (!encontrado) {
      setFuncionarioBuscado(null);
      notification.error({ message: "Funcionario no encontrado" });
      return;
    }
    console.log("encontrado", encontrado);
    setFuncionarioBuscado(encontrado);
    notification.success({ message: "Funcionario cargado" });
  };

  const handleSubmitEditarContrato = async (values) => {
    console.log("Datos en Editar Contrato", values);
    if (funcionarioBuscado.tipoContrato === values.nuevoContrato) {
      notification.info({ message: "El nuevo contrato es igual al actual" });
      return;
    }
    try {
      const respuesta = await cambiarTipoContratoFuncionario(values);
      console.log("Respuesta del cambio de contrato", respuesta);
      if (respuesta.status === 200) {
        notification.success({
          message: respuesta.data.message || "Contrato actualizado",
        });
        formEditarContrato.resetFields();
        obtenerContratos();
        obtenerColaboradores();
        return;
      }
      notification.error({
        message: respuesta.error || "Error al actualizar contrato",
      });
    } catch (error) {
      console.log("Error al editar contrato", error);
      notification.error({
        message: error.message || "Error de servidor",
      });
    } finally {
      cerrarModalEditarContrato();
    }
  };

  // Estadísticas
  const stats = {
    total: colaboradores.length,
    activos: colaboradores.filter((c) => c.estado === "Activo").length,
    inactivos: colaboradores.filter((c) => c.estado === "Inactivo").length,
  };

  const dataTableFilters = useMemo(() => {
    const uniqueValues = (field) => {
      return [
        ...new Set(colaboradores.map((item) => item[field]).filter(Boolean)),
      ]
        .map((value) => String(value))
        .sort((a, b) => a.localeCompare(b, "es"))
        .map((value) => ({ value, label: value }));
    };

    const sucursalOptions = [
      ...new Set(sucursales.map((item) => item.nombre).filter(Boolean)),
    ]
      .map((value) => String(value))
      .sort((a, b) => a.localeCompare(b, "es"))
      .map((value) => ({ value, label: value }));

    return [
      {
        key: "cargo",
        placeholder: "Cargo",
        options: uniqueValues("cargo"),
      },
      {
        key: "sucursal",
        placeholder: "Sucursal",
        options:
          sucursalOptions.length > 0
            ? sucursalOptions
            : uniqueValues("sucursal"),
      },
      {
        key: "turno",
        placeholder: "Turno",
        options: uniqueValues("turno"),
      },
      {
        key: "estado",
        placeholder: "Estado",
        options: uniqueValues("estado"),
      },
    ];
  }, [colaboradores, sucursales]);

  const columns = [
    {
      title: "Funcionario",
      key: "funcionario",
      dataIndex: null, // No usamos dataIndex directo porque renderizamos varios campos
      width: 250,
      render: (_, record) => {
        const nombre = record?.nombre || "N";
        const apellido = record?.apellido || "";
        const initials = `${nombre.charAt(0).toUpperCase()}${apellido.charAt(0).toUpperCase()}`;

        return (
          <Space key={`func-${record.id}`}>
            <Avatar
              size={40}
              icon={<UserOutlined />}
              style={{ backgroundColor: "#1890ff" }}
            >
              {/* Solo si hay inicial, sino mostramos el icono por defecto */}
              {initials && initials.length > 0 ? initials : undefined}
            </Avatar>
            <div>
              <div style={{ fontWeight: 500 }}>
                {nombre} {apellido}
              </div>
              {/* Opcional: mostrar nombreRol si es diferente al cargo o para más detalle */}
              {record.nombreRol && record.nombreRol !== record.cargo && (
                <div style={{ fontSize: "12px", color: "#888" }}>
                  {record.nombreRol}
                </div>
              )}
            </div>
          </Space>
        );
      },
    },
    {
      title: "RUT",
      dataIndex: "rut",
      key: "rut",
      width: 140,
      render: (text) => text || "S/R",
    },
    {
      title: "Cargo",
      dataIndex: "cargo",
      key: "cargo",
      width: 150,
      render: (text, record) => {
        const valor = text || "No asignado";
        const colors = {
          Administrador: "purple",
          Vendedor: "blue",
          Cajero: "green",
          Sistema: "geekblue", // Color extra para tu caso "Sistema"
        };

        return <Tag color={colors[valor] || "default"}>{valor}</Tag>;
      },
    },
    {
      title: "Sucursal",
      dataIndex: "sucursal",
      key: "sucursal",
      width: 150,
      render: (text) => <Tag color="green">{text || "Casa Matriz"}</Tag>,
    },
    {
      title: "Contacto",
      key: "contacto",
      width: 250,
      render: (_, record) => (
        <div
          key={`contacto-${record.id}`}
          style={{ display: "flex", flexDirection: "column", gap: "4px" }}
        >
          <div style={{ fontSize: "13px" }}>
            <PhoneOutlined style={{ marginRight: 4, color: "#8c8c8c" }} />
            {record?.telefono || "N/A"}
          </div>
          <div style={{ fontSize: "13px" }}>
            <MailOutlined style={{ marginRight: 4, color: "#8c8c8c" }} />
            {record?.email || "N/A"}
          </div>
        </div>
      ),
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: 120,
      fixed: "right", // Fija esta columna a la derecha si la tabla tiene scroll
      render: (text) => (
        <Badge
          status={text === "Activo" ? "success" : "error"}
          text={text || "Desconocido"}
        />
      ),
    },
  ];

  const handleAdd = () => {
    setEditMode(false);
    setSelectedColaborador(null);
    form.resetFields();
    setDrawerVisible(true);
  };

  const handleEdit = (record) => {
    console.log("Editar", record);
    setEditMode(true);
    setSelectedColaborador(record);

    form.setFieldsValue({
      ...record,
      fechaIngreso: record.fechaIngreso ? dayjs(record.fechaIngreso) : null,
    });
    setDrawerVisible(true);
  };

  const handleViewDetails = (record) => {
    console.log("Ver detalles de:", record);
    setSelectedColaborador(record);
    setDetalleTabKey("resumen");
    setDetailDrawerVisible(true);
  };

  const handleDelete = async (id) => {
    console.log("Eliminar colaborador con ID:", id);
    try {
      const response = await eliminarFuncionario(id);
      //console.log("Respuesta al eliminar colaborador:", response);
      if (response.status === 200) {
        notification.success({
          message: response.data.message || "Colaborador eliminado",
          description: "El colaborador se ha eliminado correctamente.",
          duration: 3,
        });
        obtenerColaboradores();
        return;
      }
      notification.error({
        message: response.error || "Error al eliminar colaborador",
        description: "Hubo un problema al eliminar el colaborador.",
        duration: 5,
      });
    } catch (error) {
      notification.error({
        message: error.message || "Error de servidor",
        description: "No se pudo conectar al servidor.",
        duration: 5,
      });
    }
  };
  //envio editar crear
  const handleSubmit = async (values) => {
    setLoading(true);
    const { region, comuna, direccion, ...restoValues } = values;
    const direccionCompleta = [direccion, comuna, region]
      .filter(Boolean)
      .join(", ");
    const valuesAEnviar = {
      ...restoValues,
      direccion: direccionCompleta,
    };
    //console.log("Valores a enviar", valuesAEnviar);
    //modifica la direccion
    if (editMode) {
      setLoading(true);
      try {
        const response = await editarFuncionario(valuesAEnviar);
        if (response.status === 200) {
          notification.success({
            message: response.data.message || "Colaborador actualizado",
            description: "El colaborador se ha actualizado correctamente.",
            duration: 3,
          });
          setEditMode(false);
          setDrawerVisible(false);
          obtenerColaboradores();
          setLoading(false);
          return;
        }
        notification.error({
          message: response.error || "Error al actualizar colaborador",
          description: "Hubo un problema al actualizar el colaborador.",
          duration: 5,
        });
      } catch (error) {
        notification.error({
          message: error || "Error de servidor",
          description: "No se pudo conectar al servidor.",
          duration: 5,
        });
      } finally {
        setLoading(false);
      }
    } else {
      try {
        //console.log("datos antes de enviar", valuesAEnviar);
        const response = await crearFuncionario(valuesAEnviar);
        console.log("respuesta", response);
        if (response.status === 200 || response.status === 201) {
          notification.success({
            message: "Colaborador creado",
            description: "El colaborador se ha creado correctamente.",
            duration: 3,
          });
          //setColaboradores([...colaboradores, response.data]);
          obtenerColaboradores();
          setDrawerVisible(false);
          form.resetFields();
          setLoading(false);
          return;
        }
        notification.error({
          message: response.error || "Error al crear colaborador",
          description: "Hubo un problema al crear el colaborador.",
          duration: 5,
        });
      } catch (error) {
        notification.error({
          message: error.message || "Error de servidor",
          description: "No se pudo conectar al servidor.",
          duration: 5,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCerrarModal = () => {
    setDetailDrawerVisible(false);
    setDetalleTabKey("resumen");
    setSelectedColaborador(null);
    formReasignacion.resetFields();
    setDrawerVisible(false);
    obtenerColaboradores();
  };

  const handleSubmitReasignacion = async (values) => {
    if (!selectedColaborador?.id) {
      notification.error({
        message: "No se pudo identificar al colaborador",
      });
      return;
    }

    try {
      const response = await reasignarSucursalFuncionario({
        idFuncionario: selectedColaborador.id,
        idSucursal: values.idSucursal,
        motivo: values.motivo,
      });

      if (response.status === 201) {
        notification.success({
          message: response.data.message || "Sucursal reasignada",
          description: "El colaborador fue movido a la nueva sucursal.",
          duration: 3,
        });
        formReasignacion.resetFields();
        obtenerContratos();
        obtenerColaboradores();
        handleCerrarModal();
        return;
      }

      notification.error({
        message: response.error || "Error al reasignar sucursal",
        description: "No se pudo completar la reasignación.",
        duration: 5,
      });
    } catch (error) {
      notification.error({
        message: error.message || "Error de servidor",
        description: "No se pudo conectar al servidor.",
        duration: 5,
      });
    }
  };

  useEffect(() => {
    if (detailDrawerVisible && detalleTabKey === "reasignar") {
      formReasignacion.setFieldsValue({
        idSucursal: contratoActivoColaborador?.idSucursal || undefined,
        motivo: "",
      });
    }
  }, [
    detailDrawerVisible,
    detalleTabKey,
    contratoActivoColaborador,
    formReasignacion,
  ]);

  //contratos
  // ABRIR/CERRAR Modal Editar Contrato (frontend-only)
  // const abrirModalEditarContrato = (record) => {
  //   // intentar precargar funcionario
  //   setFuncionarioBuscado(record?.funcionario || null);
  //   formEditarContrato.setFieldsValue({
  //     rutBuscar: record?.funcionario?.rut || "",
  //     turno: record?.turno || undefined,
  //     motivo: "",
  //   });
  //   setModalEditarContratoVisible(true);
  // };
  // const abrirModalCrearContrato = () => {
  //   obtenerFuncionarioSC();
  //   setModalCrearContrato(true);
  // };

  // const cerrarModalCrearContrato = () => {
  //   setModalCrearContrato(false);
  // };

  // const handleSubmitContrato = async (values) => {
  //   console.log("Valores del formulario contrato:", values);
  //   if (!values.rutFuncionario || !values.idSucursal) {
  //     notification.error({
  //       message: "Faltan datos obligatorios",
  //       description: "Debes seleccionar un funcionario y una sucursal.",
  //     });
  //     return;
  //   }
  //   try {
  //     const response = await asignarContratoAFuncionarioSinContrato(values);
  //     console.log("respuesta asignar contrato", response);
  //     if (response.status === 201) {
  //       notification.success({
  //         message: response.data.message || "Contrato asignado",
  //         description: "El contrato se ha asignado correctamente.",
  //         duration: 3,
  //       });
  //       cerrarModalCrearContrato();
  //       obtenerContratos();
  //       obtenerColaboradores();
  //       return;
  //     }
  //     notification.error({
  //       message: response.error || "Error al asignar contrato",
  //       description: "Hubo un problema al asignar el contrato.",
  //       duration: 5,
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     notification.error({
  //       message: error.message || "Error de servidor",
  //       description: "No se pudo conectar al servidor.",
  //       duration: 5,
  //     });
  //   }
  // };

  //modal permisos

  //modal permisos
  useEffect(() => {
    console.log(
      "funcionarioPermisosSeleccionado ha cambiado:",
      funcionarioPermisosSeleccionado,
    );
    if (
      funcionarioPermisosSeleccionado &&
      funcionarioPermisosSeleccionado.privilegios
    ) {
      formPermisos.setFieldsValue(funcionarioPermisosSeleccionado.privilegios);
      console.log(
        "Permisos cargados en formulario:",
        formPermisos.getFieldsValue(),
      );
    } else {
      formPermisos.resetFields();
    }
  }, [funcionarioPermisosSeleccionado, formPermisos]);

  const handleCambiarClavesFuncionario = async (valores) => {
    try {
      const response = await actualizarClavesFuncionario(
        funcionarioPermisosSeleccionado.id,
        valores,
      );
      if (response.status === 200) {
        notification.success({ message: "Claves actualizadas correctamente" });
        cerrarModalPermisos();
        handleCerrarModal();
      } else {
        notification.error({
          message: "Error al actualizar claves",
          description: response.data?.error || "Ocurrió un error desconocido",
        });
      }
    } catch (error) {
      console.error(
        "Error al actualizar claves del funcionario:",
        error.response?.data?.error,
      );
      notification.error({
        message: "Error al actualizar claves",
        description:
          error.response?.data?.error || "Ocurrió un error desconocido",
      });
    }
  };

  const onGuardarPermisos = async (valores) => {
    try {
      const response = await actualizarPrivilegiosFuncionario(
        funcionarioPermisosSeleccionado.id,
        valores,
      );
      if (response.status === 200) {
        notification.success({
          message: "Permisos actualizados correctamente",
        });
        obtenerColaboradores();
        cerrarModalPermisos();
      } else {
        notification.error({
          message: "Error al guardar permisos",
          description: response.data?.error || "Ocurrió un error desconocido",
        });
      }
    } catch (error) {
      console.error("Error al guardar permisos:", error);
      notification.error({
        message: "Error al guardar permisos",
        description:
          error.response?.data?.error || "Ocurrió un error desconocido",
      });
    }
  };

  // modal roles crud
  const abrirModalCrearRol = () => {
    setRolEditando(null);
    formRol.resetFields();
    setModalRolVisible(true);
  };

  const abrirModalEditarRol = (rol) => {
    setRolEditando(rol);
    formRol.setFieldsValue({
      nombreRol: rol.nombreRol,
      ...rol.privilegiosRol,
    });
    setModalRolVisible(true);
  };

  const guardarRol = async (valores) => {
    // 1. Separar el nombreRol de los privilegios
    const { nombreRol, ...privilegiosRol } = valores;
    const payload = { nombreRol, privilegiosRol };
    console.log("Payload a enviar para rol:", payload);
    try {
      if (rolEditando) {
        const response = await editarRol(rolEditando.idRol, payload); // Reemplaza con tu llamada API real
        if (response.status !== 200) {
          notification.error({
            message: response.data?.error || "Error al actualizar el rol",
          });
          return;
        } else {
          notification.success({ message: "Rol actualizado con éxito" });
          obtenerColaboradores();
          cargarRoles();
        }
      } else {
        const response = await crearRol(payload); // Reemplaza con tu llamada API real
        if (response.status !== 201) {
          notification.error({
            message: response.data?.error || "Error al crear el rol",
          });
          return;
        } else {
          notification.success({ message: "Rol creado con éxito" });
          obtenerColaboradores();
          cargarRoles();
        }
      }
      setModalRolVisible(false);
    } catch (error) {
      console.error("Error al guardar el rol:", error);
      notification.error({ message: "Error al guardar el rol" });
    }
  };

  const funcionEliminarRol = async (idRol) => {
    try {
      const response = await eliminarRol(idRol); // Reemplaza con tu llamada API real
      if (response.status !== 200) {
        notification.error({
          message: response.data?.error || "Error al eliminar el rol",
        });
        return;
      } else {
        notification.success({ message: "Rol eliminado con éxito" });
        obtenerColaboradores();
        cargarRoles();
      }
    } catch (error) {
      console.error("Error al eliminar el rol:", error);
      notification.error({ message: "Error al eliminar el rol" });
    }
  };

  // --- Columnas de la Tabla ---
  const columnasRoles = [
    {
      title: "Nombre del Rol",
      dataIndex: "nombreRol",
      key: "nombreRol",
      render: (text) => <Typography.Text strong>{text}</Typography.Text>,
    },
    {
      title: "Permisos Activos",
      key: "permisos",
      render: (_, record) => {
        const permisosActivos = Object.values(
          record.privilegiosRol || {},
        ).filter(Boolean).length;
        return <Tag color="blue">{permisosActivos} permisos habilitados</Tag>;
      },
    },
    {
      title: "Acciones",
      key: "acciones",
      align: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined style={{ color: "#1890ff" }} />}
            onClick={() => abrirModalEditarRol(record)}
          />
          {/* Protección para no borrar roles core */}
          {record.nombreRol !== "Sistema" &&
            record.nombreRol !== "Administrador" && (
              <Popconfirm
                title="¿Eliminar este rol?"
                description="Los usuarios con este rol perderán sus accesos por defecto."
                onConfirm={() => funcionEliminarRol(record.idRol)} // Llamamos a la función de eliminar
                okText="Sí, eliminar"
                cancelText="Cancelar"
              >
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            )}
        </Space>
      ),
    },
  ];
  return (
    <div>
      <>
        {/* Header con estadísticas */}
        <Card style={{ marginBottom: 24 }}>
          <Row gutter={16} align="middle">
            <Col flex="auto">
              <Title level={2} style={{ margin: 0 }}>
                <TeamOutlined style={{ marginRight: 12 }} />
                Gestión de Colaboradores
              </Title>
              <Text type="secondary">
                Administra el personal de tus sucursales
              </Text>
            </Col>
            <Col span={10}>
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Card>
                    <Statistic
                      title="Total Colaboradores"
                      value={stats.total}
                      prefix={<TeamOutlined />}
                      valueStyle={{ color: "#1890ff" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card>
                    <Statistic
                      title="Colaboradores Activos"
                      value={stats.activos}
                      prefix={<CheckCircleOutlined />}
                      valueStyle={{ color: "#52c41a" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card>
                    <Statistic
                      title="Colaboradores Inactivos"
                      value={stats.inactivos}
                      prefix={<CloseCircleOutlined />}
                      valueStyle={{ color: "#ff4d4f" }}
                    />
                  </Card>
                </Col>
              </Row>
            </Col>
            {/* <Col>
                      <Button
                        type="primary"
                        size="large"
                        icon={<UserAddOutlined />}
                        onClick={handleAdd}
                      >
                        Nuevo Colaborador
                      </Button>
                    </Col> */}
          </Row>
        </Card>

        {/* Tabla */}
        <Card>
          <Tabs
            items={[
              {
                key: "gestion_empleados",
                label: "Gestión de Colaboradores",
                children: (
                  <DataTable
                    columns={columns}
                    data={colaboradores}
                    rowKey="id"
                    loading={loading}
                    searchPlaceholder="Buscar por nombre, RUT o sucursal..."
                    searchableFields={["nombre", "apellido", "rut", "sucursal"]}
                    filterConfig={dataTableFilters}
                    headerButtons={
                      <Space>
                        <Button
                          type="primary"
                          icon={<UserAddOutlined />}
                          onClick={handleAdd}
                        >
                          Nuevo Colaborador
                        </Button>
                        {/*<Button
                          type="primary"
                          icon={<FileTextOutlined />}
                          onClick={() => abrirModalEditarContrato()}
                        >
                          Editar Contrato
                        </Button>*/}
                      </Space>
                    }
                    onRowClick={(record) => handleViewDetails(record)}
                  />
                ),
              },
              {
                key: "Accesos y Permisos",
                label: "Accesos y Permisos",
                children: (
                  <>
                    <Row
                      gutter={16}
                      align="middle"
                      style={{ marginBottom: 24 }}
                    >
                      <Col xs={24} md={12}>
                        <Card>
                          <Title level={4} style={{ marginTop: 0 }}>
                            Selección de sucursal
                          </Title>
                          <Text type="secondary">
                            Elige una sucursal para ver los funcionarios
                            asociados.
                          </Text>
                          <div style={{ marginTop: 16 }}>
                            <Select
                              style={{ width: "100%" }}
                              placeholder="Selecciona una sucursal"
                              value={sucursalPermisosSeleccionada}
                              onChange={(value) =>
                                setSucursalPermisosSeleccionada(value)
                              }
                              options={sucursales.map((sucursal) => ({
                                value: sucursal.idSucursal,
                                label: sucursal.nombre,
                              }))}
                            />
                          </div>
                        </Card>
                      </Col>
                      <Col xs={24} md={12}>
                        <Card
                          title="Resumen"
                          bordered={false}
                          style={{ height: "100%" }}
                        >
                          <Text>
                            {sucursalPermisosSeleccionada
                              ? `${funcionariosPorSucursalPermisos.length} funcionario(s) encontrados en ${sucursalSeleccionadaPermisosNombre || "la sucursal seleccionada"}`
                              : "Selecciona una sucursal para ver sus funcionarios."}
                          </Text>
                        </Card>
                      </Col>
                    </Row>
                    <Row gutter={[16, 16]}>
                      {funcionariosPorSucursalPermisos.length > 0 ? (
                        funcionariosPorSucursalPermisos.map((funcionario) => (
                          <Col
                            xs={24}
                            sm={12}
                            lg={8}
                            key={funcionario.idFuncionario}
                          >
                            <Card
                              onClick={() =>
                                console.log("presione a :", funcionario?.nombre)
                              }
                              extra={
                                <Button
                                  icon={<EyeOutlined />}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    abrirModalPermisos(funcionario);
                                  }}
                                >
                                  Accesos
                                </Button>
                              }
                            >
                              <Space align="start">
                                <Avatar
                                  size={44}
                                  icon={<UserOutlined />}
                                  style={{
                                    backgroundColor: "#1890ff",
                                  }}
                                >
                                  {String(funcionario?.nombre || "")
                                    .charAt(0)
                                    .toUpperCase()}
                                  {String(funcionario?.apellido || "")
                                    .charAt(0)
                                    .toUpperCase()}
                                </Avatar>
                                <div>
                                  <Title level={5} style={{ margin: 0 }}>
                                    {funcionario.nombre} {funcionario.apellido}
                                  </Title>
                                  <Text type="secondary">
                                    {funcionario.rut}
                                  </Text>
                                  <div style={{ marginTop: 8 }}>
                                    <Tag color="green">
                                      {funcionario.sucursalNombre}
                                    </Tag>
                                    {funcionario.cargo ? (
                                      <Tag color="blue">
                                        {funcionario.cargo}
                                      </Tag>
                                    ) : null}
                                    {funcionario.turno ? (
                                      <Tag color="orange">
                                        {funcionario.turno}
                                      </Tag>
                                    ) : null}
                                  </div>
                                </div>
                              </Space>
                            </Card>
                          </Col>
                        ))
                      ) : (
                        <Col span={24}>
                          <Card title="Funcionarios">
                            <Text type="secondary">
                              {sucursalPermisosSeleccionada
                                ? "No hay funcionarios asociados a esta sucursal."
                                : "Selecciona una sucursal para mostrar los funcionarios aquí."}
                            </Text>
                          </Card>
                        </Col>
                      )}
                    </Row>
                  </>
                ),
              },
              {
                key: "roles",
                label: "Roles y Permisos",
                children: (
                  <div style={{ padding: "16px 0" }}>
                    <Row gutter={[16, 16]}>
                      <Col span={24}>
                        <Card
                          title="Gestión de Roles del Sistema"
                          extra={
                            <Button
                              type="primary"
                              icon={<PlusOutlined />}
                              onClick={abrirModalCrearRol}
                            >
                              Nuevo Rol
                            </Button>
                          }
                        >
                          <Table
                            columns={columnasRoles}
                            dataSource={roles}
                            rowKey="idRol"
                            pagination={{ pageSize: 5 }}
                            size="middle"
                          />
                        </Card>
                      </Col>
                    </Row>

                    {/* MODAL PARA CREAR/EDITAR ROL */}
                    <Modal
                      title={rolEditando ? "Editar Rol" : "Crear Nuevo Rol"}
                      open={modalRolVisible}
                      onCancel={() => setModalRolVisible(false)}
                      width={800}
                      footer={[
                        <Button
                          key="cancelar"
                          onClick={() => setModalRolVisible(false)}
                        >
                          Cancelar
                        </Button>,
                        <Button
                          key="guardar"
                          type="primary"
                          onClick={() => formRol.submit()}
                        >
                          {rolEditando ? "Guardar Cambios" : "Crear Rol"}
                        </Button>,
                      ]}
                    >
                      <Form
                        form={formRol}
                        layout="vertical"
                        onFinish={guardarRol}
                        style={{ marginTop: 16 }}
                      >
                        <Row gutter={16}>
                          <Col xs={24} md={12}>
                            <Form.Item
                              name="nombreRol"
                              label="Nombre del Rol"
                              rules={[
                                {
                                  required: true,
                                  message: "El nombre es obligatorio",
                                },
                                {
                                  min: 3,
                                  message: "Debe tener al menos 3 caracteres",
                                },
                              ]}
                            >
                              <Input placeholder="Ej. Vendedor Senior, Cajero..." />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Divider orientation="left">
                          Configuración de Privilegios Base
                        </Divider>

                        <Typography.Text
                          type="secondary"
                          style={{ display: "block", marginBottom: 16 }}
                        >
                          Los funcionarios que tengan asignado este rol
                          heredarán los permisos activados a continuación.
                        </Typography.Text>

                        {/* Reutilizamos la misma grilla responsiva de permisos */}
                        <Row gutter={[24, 12]}>
                          {Object.entries(etiquetasPermisos).map(
                            ([key, label]) => (
                              <Col xs={24} sm={12} md={8} key={key}>
                                <Form.Item
                                  name={key}
                                  valuePropName="checked"
                                  style={{ marginBottom: 0 }}
                                  initialValue={false} // Por defecto en false al crear nuevo
                                >
                                  <Switch
                                    checkedChildren="Sí"
                                    unCheckedChildren="No"
                                  />
                                </Form.Item>
                                <Typography.Text style={{ marginLeft: 8 }}>
                                  {label}
                                </Typography.Text>
                              </Col>
                            ),
                          )}
                        </Row>
                      </Form>
                    </Modal>
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </>

      {/* Drawer para Crear/Editar */}
      <Drawer
        title={
          <Space>
            {editMode ? <EditOutlined /> : <UserAddOutlined />}
            <span>{editMode ? "Editar Colaborador" : "Nuevo Colaborador"}</span>
          </Space>
        }
        width={720}
        onClose={handleCerrarModal}
        open={drawerVisible}
        extra={
          <Space>
            <Button onClick={handleCerrarModal}>Cancelar</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={loading}
            >
              {editMode ? "Actualizar" : "Guardar"}
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          // initialValues={{
          //   estadoContrato: "Activo",
          //   turno: "Mañana",
          //   contrato: "Plazo Fijo",
          // }}
        >
          <Title level={5}>Información Personal</Title>
          <Divider style={{ marginTop: 8, marginBottom: 16 }} />

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="nombre"
                label="Nombre"
                rules={[
                  { required: true, message: "Por favor ingrese el nombre" },
                ]}
              >
                <Input
                  placeholder="Ingrese el nombre"
                  prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="apellido"
                label="Apellido"
                rules={[
                  { required: true, message: "Por favor ingrese el apellido" },
                ]}
              >
                <Input
                  placeholder="Ingrese el apellido"
                  prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="rut"
                label="RUT"
                rules={[
                  { required: true, message: "Por favor ingrese el RUT" },
                  {
                    pattern: /^[0-9]{7,8}-[0-9kK]$/,
                    message: "Formato de RUT inválido",
                  },
                  {
                    min: 10,
                    max: 10,
                    message: "RUT debe tener formato 12345678-9",
                  },
                ]}
                normalize={(value) => {
                  if (!value) return value;

                  const cleaned = value.replace(/[^0-9kK]/g, "");

                  const limited = cleaned.slice(0, 9);

                  if (limited.length <= 1) return limited;

                  const number = limited.slice(0, -1);
                  const verifier = limited.slice(-1).toUpperCase();

                  return `${number}-${verifier}`;
                }}
              >
                <Input
                  disabled={editMode}
                  placeholder="12345678-9"
                  prefix={<IdcardOutlined />}
                  min={10}
                  maxLength={10}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                hidden={editMode}
                name="fechaIngreso"
                label="Fecha de Ingreso"
                initialValue={dayjs()}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Seleccione fecha"
                />
              </Form.Item>
              <Form.Item name="estado" label="Estado" hidden={!editMode}>
                <Select style={{ width: "100%" }}>
                  <Option value="Activo">Activo</Option>
                  <Option value="Inactivo">Inactivo</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Title level={5} style={{ marginTop: 24 }}>
            Información de Contacto
          </Title>
          <Divider style={{ marginTop: 8, marginBottom: 16 }} />

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Correo Electrónico"
                rules={[
                  {
                    required: true,
                    type: "email",
                    message: "Por favor ingrese un correo válido",
                  },
                ]}
              >
                <Input
                  placeholder="correo@ejemplo.cl"
                  prefix={<MailOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="telefono"
                label="Teléfono"
                rules={[
                  { required: true, message: "Por favor ingrese el teléfono" },
                ]}
              >
                <Input
                  addonBefore="+56"
                  placeholder="9 1234 5678"
                  maxLength={9}
                  prefix={<PhoneOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="region" label="Región">
                <Select placeholder="Seleccione una región">
                  <Option value="Arica y Parinacota">Arica y Parinacota</Option>
                  <Option value="Tarapaca">Tarapaca</Option>
                  <Option value="Antofagasta">Antofagasta</Option>
                  <Option value="Atacama">Atacama</Option>
                  <Option value="Coquimbo">Coquimbo</Option>
                  <Option value="Valparaíso">Valparaíso</Option>
                  <Option value="Metropolitana">Metropolitana</Option>
                  <Option value="O'Higgins">O'Higgins</Option>
                  <Option value="Maule">Maule</Option>
                  <Option value="Ñuble">Ñuble</Option>
                  <Option value="Biobío">Biobío</Option>
                  <Option value="La Araucanía">La Araucanía</Option>
                  <Option value="los Ríos">los Ríos</Option>
                  <Option value="Los Lagos">Los Lagos</Option>
                  <Option value="Aysen">Aysen</Option>
                  <Option value="Magallanes y Antártica Chilena">
                    Magallanes y Antártica Chilena
                  </Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="comuna" label="Comuna">
                <Select
                  showSearch
                  placeholder="Seleccione una comuna"
                  optionFilterProp="children"
                >
                  {comunasPorRegion.map((region) => (
                    <OptGroup key={region.label} label={region.label}>
                      {region.options.map((comuna) => (
                        <Option
                          key={`${region.label}-${comuna}`}
                          value={comuna}
                        >
                          {comuna}
                        </Option>
                      ))}
                    </OptGroup>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="direccion" label="Dirección">
            <Input
              placeholder="Ingrese la dirección"
              prefix={<HomeOutlined />}
            />
          </Form.Item>
          <Title level={5} style={{ marginTop: 24 }}>
            Información Laboral
          </Title>
          <Divider style={{ marginTop: 8, marginBottom: 16 }} />

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="nombreRol"
                label="Cargo"
                rules={[
                  { required: true, message: "Por favor seleccione el cargo" },
                ]}
              >
                <Select placeholder="Seleccione un cargo">
                  {roles.map((rol) => (
                    <Option key={rol.id} value={rol.nombre}>
                      {rol.nombre}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="idSucursal"
                label="Sucursal"
                rules={[
                  {
                    required: true,
                    message: "Por favor seleccione la sucursal",
                  },
                ]}
              >
                <Select placeholder="Seleccione una sucursal">
                  {sucursales.map((sucursal) => (
                    <Option
                      key={sucursal.idSucursal}
                      value={sucursal.idSucursal}
                    >
                      {sucursal.nombre}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="turno"
                label="Turno"
                rules={[
                  { required: true, message: "Por favor seleccione el turno" },
                ]}
              >
                <Select placeholder="Seleccione un turno">
                  <Option value="Mañana">Mañana </Option>
                  <Option value="Tarde">Tarde</Option>
                  <Option value="Noche">Noche</Option>
                  <Option value="Rotativo">Rotativo</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="contrato"
                label="Tipo de Contrato"
                rules={[
                  {
                    required: true,
                    message: "Por favor seleccione el tipo de contrato",
                  },
                ]}
              >
                <Select placeholder="Seleccione tipo de contrato">
                  <Option value="Indefinido">Indefinido</Option>
                  <Option value="Plazo Fijo">Plazo Fijo</Option>

                  <Option value="Honorarios">Honorarios</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row> */}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="estadoContrato"
                label="Estado Relacion Laboral"
                rules={[
                  { required: true, message: "Por favor seleccione el estado" },
                ]}
                initialValue="Activo"
              >
                <Select placeholder="Seleccione el estado" disabled={!editMode}>
                  <Option value="Activo">Activo</Option>
                  <Option value="Inactivo">Inactivo</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>

      {/* Drawer de Detalles - Reasignar Sucursal  */}
      <Drawer
        title={
          <Space>
            <Avatar
              size={40}
              icon={<UserOutlined />}
              style={{ backgroundColor: "#1890ff" }}
            >
              {selectedColaborador?.nombre}
              {selectedColaborador?.apellido}
            </Avatar>
            <span>
              {selectedColaborador?.nombre} {selectedColaborador?.apellido}
            </span>
          </Space>
        }
        width={700}
        onClose={handleCerrarModal}
        open={detailDrawerVisible}
        extra={
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setDetailDrawerVisible(false);
                handleEdit(selectedColaborador);
              }}
            >
              Editar
            </Button>
            <Popconfirm
              title="¿Está seguro de eliminar este colaborador?"
              onConfirm={() => {
                handleDelete(selectedColaborador?.id);
                setDetailDrawerVisible(false);
              }}
              okText="Sí"
              cancelText="No"
            >
              <Button danger icon={<DeleteOutlined />}>
                Eliminar
              </Button>
            </Popconfirm>
          </Space>
        }
        centered
      >
        {selectedColaborador && (
          <Tabs
            activeKey={detalleTabKey}
            onChange={(key) => {
              setDetalleTabKey(key);
              if (key === "sucursales") {
                cargarHistorial(selectedColaborador?.id);
              }
            }}
            items={[
              {
                key: "resumen",
                label: "Resumen",
                children: (
                  <>
                    {/**Header con avatar, nombre, cargo y estado */}
                    <Card style={{ marginBottom: 16 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 0",
                        }}
                      >
                        {/* Sección Izquierda: Avatar + Nombre + Cargo */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                          }}
                        >
                          <Avatar
                            size={50}
                            icon={<UserOutlined />}
                            style={{
                              backgroundColor: "#1890ff",
                              flexShrink: 0,
                            }}
                          >
                            {selectedColaborador.nombre
                              ?.charAt(0)
                              ?.toUpperCase() || "N"}
                            {selectedColaborador.apellido
                              ?.charAt(0)
                              ?.toUpperCase() || ""}
                          </Avatar>

                          <div>
                            <Title
                              level={3}
                              style={{ margin: 0, marginBottom: 4 }}
                            >
                              {selectedColaborador.nombre}{" "}
                              {selectedColaborador.apellido}
                            </Title>
                            <Tag color="blue" style={{ fontSize: "14px" }}>
                              {selectedColaborador.cargo}
                            </Tag>
                          </div>
                        </div>

                        {/* Sección Derecha: Estado */}
                        <Badge
                          status={
                            selectedColaborador.estado === "Activo"
                              ? "success"
                              : "error"
                          }
                          text={selectedColaborador.estado}
                          style={{ fontSize: "14px", marginRight: 8 }}
                        />
                      </div>
                    </Card>
                    {/**Informacion Personal */}
                    <Card
                      title="Información Personal"
                      style={{ marginBottom: 16 }}
                    >
                      <Descriptions column={2}>
                        <Descriptions.Item
                          label={
                            <span>
                              <IdcardOutlined style={{ marginRight: 8 }} />
                              RUT
                            </span>
                          }
                        >
                          {selectedColaborador.rut}
                        </Descriptions.Item>
                        <Descriptions.Item
                          label={
                            <span>
                              <MailOutlined style={{ marginRight: 8 }} />
                              Email
                            </span>
                          }
                        >
                          {selectedColaborador.email}
                        </Descriptions.Item>
                        <Descriptions.Item
                          label={
                            <span>
                              <PhoneOutlined style={{ marginRight: 8 }} />
                              Teléfono
                            </span>
                          }
                        >
                          {selectedColaborador.telefono}
                        </Descriptions.Item>
                        <Descriptions.Item
                          span={2}
                          label={
                            <span>
                              <HomeOutlined style={{ marginRight: 8 }} />
                              Dirección
                            </span>
                          }
                        >
                          {selectedColaborador.direccion}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                    {/**Informacion Laboral */}
                    <Card
                      title="Información Laboral"
                      style={{ marginBottom: 16 }}
                    >
                      <Descriptions column={2}>
                        <Descriptions.Item label="Sucursal" span={2}>
                          {contratoActivoColaborador?.sucursal?.nombre ||
                            selectedColaborador.sucursal ||
                            "Sin Informacion"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Cargo">
                          <Tag color="blue">
                            {selectedColaborador.cargo || "Sin Informacion"}
                          </Tag>
                        </Descriptions.Item>
                        {/* <Descriptions.Item label="Turno">
                          <Tag color="orange">
                            {contratoActivoColaborador?.turno ||
                              selectedColaborador.turno ||
                              "Sin Informacion"}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Tipo de Contrato">
                          {contratoActivoColaborador?.tipoContrato ||
                            selectedColaborador.tipoContrato ||
                            "Sin Informacion"}
                        </Descriptions.Item> */}
                        <Descriptions.Item
                          label={
                            <span>
                              <CalendarOutlined style={{ marginRight: 8 }} />
                              Fecha de Ingreso
                            </span>
                          }
                        >
                          {contratoActivoColaborador?.fechaIngreso ||
                          selectedColaborador?.fechaIngreso
                            ? dayjs(
                                contratoActivoColaborador?.fechaIngreso ||
                                  selectedColaborador?.fechaIngreso,
                              ).format("DD/MM/YYYY")
                            : "Sin Informacion"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Estado Relación Laboral">
                          <Tag
                            color={
                              selectedColaborador.estado === "Activo"
                                ? "green"
                                : "red"
                            }
                          >
                            {selectedColaborador.estado || "Sin Informacion"}
                          </Tag>
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                    {/**Estadísticas */}
                    <Card title="Estadísticas">
                      <Row gutter={16}>
                        {/* <Col span={12}>
                          <Statistic
                            title="Días Trabajando"
                            value={
                              contratoActivoColaborador?.fechaIngreso ||
                              selectedColaborador.fechaIngreso
                                ? dayjs().diff(
                                    dayjs(
                                      contratoActivoColaborador?.fechaIngreso ||
                                        selectedColaborador.fechaIngreso,
                                    ),
                                    "day",
                                  )
                                : "N/A"
                            }
                            suffix="días"
                          />
                        </Col> */}
                        <Col span={12}>
                          <Statistic
                            title="Antigüedad"
                            value={
                              contratoActivoColaborador?.fechaIngreso ||
                              selectedColaborador.fechaIngreso
                                ? dayjs().diff(
                                    dayjs(
                                      contratoActivoColaborador?.fechaIngreso ||
                                        selectedColaborador.fechaIngreso,
                                    ),
                                    "month",
                                  )
                                : "N/A"
                            }
                            suffix="meses"
                          />
                        </Col>
                      </Row>
                    </Card>
                  </>
                ),
              },
              {
                key: "sucursales",
                label: "Sucursales",
                children: (
                  <>
                    <Card style={{ marginBottom: 16 }}>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Statistic
                            title="Sucursales vinculadas"
                            value={
                              new Set(
                                historialContratos.map((c) => c.idSucursal),
                              ).size
                            }
                          />
                        </Col>
                        {/* <Col span={12}>
                          <Statistic
                            title="Contratos registrados"
                            value={historialContratos.length}
                          />
                        </Col> */}
                      </Row>
                      {/* <div style={{ marginTop: 12 }}>
                        <Tag
                          color={
                            sucursalesDelColaborador.length > 2
                              ? "red"
                              : "green"
                          }
                        >
                          {sucursalesDelColaborador.length > 2
                            ? "Trabaja en más de 2 sucursales"
                            : "Trabaja en 2 o menos sucursales"}
                        </Tag>
                      </div> */}
                    </Card>

                    <Card title="Historial de sucursales">
                      {historialContratos.length === 0 ? (
                        <Text type="secondary">
                          No hay contratos registrados para este colaborador.
                        </Text>
                      ) : (
                        <Space
                          direction="vertical"
                          style={{ width: "100%" }}
                          size="middle"
                        >
                          {historialContratos.map((contrato) => (
                            <Card
                              key={contrato.idContratoFuncionario}
                              size="small"
                            >
                              <Row
                                justify="space-between"
                                align="middle"
                                gutter={16}
                              >
                                <Col>
                                  <Text strong>
                                    {contrato?.sucursal?.nombre ||
                                      "Sin sucursal"}
                                  </Text>
                                  <div>
                                    <Text type="secondary">
                                      {contrato?.sucursal?.direccion ||
                                        "Sin dirección"}
                                    </Text>
                                  </div>
                                  <div style={{ marginTop: 4 }}>
                                    <Text type="secondary">
                                      Ingreso:{" "}
                                      {contrato?.fechaIngreso
                                        ? dayjs(contrato.fechaIngreso).format(
                                            "DD/MM/YYYY",
                                          )
                                        : "Sin fecha"}
                                    </Text>
                                  </div>
                                  {contrato?.motivoCambioContrato && (
                                    <div style={{ marginTop: 8 }}>
                                      <Text
                                        type="secondary"
                                        style={{
                                          fontSize: 11,
                                          textTransform: "uppercase",
                                          letterSpacing: "0.05em",
                                        }}
                                      >
                                        Motivo
                                      </Text>
                                      <div
                                        style={{
                                          marginTop: 4,
                                          background: "#f9fafb",
                                          border: "0.5px solid #e5e7eb",
                                          borderRadius: 6,
                                          padding: "8px 10px",
                                          maxHeight: 80, // altura máxima
                                          overflowY: "auto", // scroll si supera
                                          fontSize: 13,
                                          color: "rgba(0,0,0,0.65)",
                                          lineHeight: 1.6,
                                          wordBreak: "break-word", // corta palabras largas
                                          whiteSpace: "pre-wrap", // respeta saltos de línea
                                        }}
                                      >
                                        {contrato.motivoCambioContrato}
                                      </div>
                                    </div>
                                  )}
                                </Col>
                                <Col style={{ marginTop: 10 }}>
                                  <Space
                                    direction="horizontal"
                                    align="end"
                                    size={4}
                                  >
                                    <Tag
                                      color={
                                        contrato.estado === "Activo"
                                          ? "green"
                                          : "default"
                                      }
                                    >
                                      {contrato.estado || "Sin estado"}
                                    </Tag>
                                    {/* <Tag color="blue">
                                      {contrato.tipoContrato || "Sin contrato"}
                                    </Tag>
                                    <Tag color="orange">
                                      {contrato.turno || "Sin turno"}
                                    </Tag> */}
                                  </Space>
                                </Col>
                              </Row>
                            </Card>
                          ))}
                        </Space>
                      )}
                    </Card>
                  </>
                ),
              },
              {
                key: "reasignar",
                label: "Reasignar",
                children: (
                  <>
                    <Card style={{ marginBottom: 16 }}>
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="Sucursal actual">
                          {contratoActivoColaborador?.sucursal?.nombre ||
                            selectedColaborador.sucursal ||
                            "Sin Informacion"}
                        </Descriptions.Item>
                        {/* <Descriptions.Item label="Turno actual">
                          {contratoActivoColaborador?.turno ||
                            selectedColaborador.turno ||
                            "Sin Informacion"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tipo de contrato actual">
                          {contratoActivoColaborador?.tipoContrato ||
                            selectedColaborador.tipoContrato ||
                            "Sin Informacion"}
                        </Descriptions.Item> */}
                      </Descriptions>
                    </Card>

                    <Form
                      form={formReasignacion}
                      layout="vertical"
                      onFinish={handleSubmitReasignacion}
                    >
                      <Form.Item
                        name="idSucursal"
                        label="Nueva sucursal"
                        rules={[
                          {
                            required: true,
                            message: "Seleccione una sucursal",
                          },
                        ]}
                      >
                        <Select placeholder="Seleccione una sucursal">
                          {sucursales.map((sucursal) => (
                            <Option
                              key={sucursal.idSucursal}
                              value={sucursal.idSucursal}
                            >
                              {sucursal.nombre}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        name="motivo"
                        label="Motivo de reasignación"
                        rules={[
                          { required: true, message: "Ingrese el motivo" },
                        ]}
                      >
                        <Input.TextArea
                          rows={4}
                          placeholder="Ej: cobertura operacional, rotación interna, cambio de base"
                        />
                      </Form.Item>

                      <Button type="primary" htmlType="submit">
                        Reasignar colaborador
                      </Button>
                    </Form>
                  </>
                ),
              },
            ]}
          />
        )}
      </Drawer>
      {/**Modal Permisos y Código de Acceso */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <span>Gestión de Accesos y Permisos</span>
          </Space>
        }
        open={modalPermisosVisible}
        onCancel={cerrarModalPermisos}
        width={800}
        footer={<Button onClick={cerrarModalPermisos}>Cerrar</Button>} // Quitamos el botón imprimir del footer general y lo ponemos en su Tab
      >
        {funcionarioPermisosSeleccionado ? (
          <>
            {/* CABECERA FIJA (Perfil del usuario) */}
            <Card style={{ marginBottom: 16 }} size="small">
              <Row gutter={16} align="middle">
                <Col xs={24} sm={4} style={{ textAlign: "center" }}>
                  <Avatar
                    size={64}
                    icon={<UserOutlined />}
                    style={{ backgroundColor: "#1890ff" }}
                  >
                    {String(funcionarioPermisosSeleccionado?.nombre || "")
                      .charAt(0)
                      .toUpperCase()}
                    {String(funcionarioPermisosSeleccionado?.apellido || "")
                      .charAt(0)
                      .toUpperCase()}
                  </Avatar>
                </Col>
                <Col xs={24} sm={20}>
                  <Title level={4} style={{ margin: 0 }}>
                    {funcionarioPermisosSeleccionado.nombre}{" "}
                    {funcionarioPermisosSeleccionado.apellido}
                  </Title>
                  <Text type="secondary">
                    {funcionarioPermisosSeleccionado.rut}
                  </Text>
                  <div style={{ marginTop: 4 }}>
                    <Tag color="green">
                      {funcionarioPermisosSeleccionado.sucursalNombre ||
                        funcionarioPermisosSeleccionado.sucursal ||
                        "Casa Matriz"}
                    </Tag>
                    {funcionarioPermisosSeleccionado.cargo && (
                      <Tag color="blue">
                        {funcionarioPermisosSeleccionado.cargo}
                      </Tag>
                    )}
                  </div>
                </Col>
              </Row>
            </Card>

            {/* SISTEMA DE PESTAÑAS */}
            <Tabs
              defaultActiveKey="1"
              items={[
                {
                  key: "1",
                  label: "Código de Acceso",
                  children: (
                    <Card style={{ textAlign: "center", marginTop: 8 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          minHeight: 110,
                        }}
                      >
                        <img
                          src={generarSVGBarcode(
                            funcionarioPermisosSeleccionado.codigoAcceso,
                          )}
                          alt="Código de barras Acceso Caja"
                        />
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <Text
                          type="secondary"
                          style={{
                            fontSize: 14,
                            fontFamily: "monospace",
                            letterSpacing: 2,
                          }}
                        >
                          {funcionarioPermisosSeleccionado?.codigoAcceso}
                        </Text>
                      </div>
                      <Divider style={{ margin: "16px 0" }} />
                      <Text
                        type="secondary"
                        style={{ display: "block", marginBottom: 16 }}
                      >
                        Este código se usa para la autenticación rápida en el
                        Punto de Venta.
                      </Text>
                      <Button type="primary" onClick={imprimirCodigoAcceso}>
                        Imprimir Código de Barras
                      </Button>
                    </Card>
                  ),
                },
                {
                  key: "2",
                  label: "Claves de Sistema",
                  children: (
                    <Card style={{ marginTop: 8 }}>
                      <Form
                        form={formClaves}
                        layout="vertical"
                        onFinish={handleCambiarClavesFuncionario}
                      >
                        <Row gutter={16}>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              name="claveAdministracion"
                              label="Nueva clave de Administración"
                              // rules={[
                              //   {
                              //     required: true,
                              //     message: "Ingrese una clave",
                              //   },
                              // ]}
                            >
                              <Input.Password placeholder="Dejar en blanco para no cambiar" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              name="claveCaja"
                              label="Nueva clave de Caja (PIN)"
                              // rules={[
                              //   { required: true, message: "Ingrese un PIN" },
                              // ]}
                            >
                              <Input.Password placeholder="Dejar en blanco para no cambiar" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row justify="end">
                          <Button type="primary" htmlType="submit">
                            Actualizar Claves
                          </Button>
                        </Row>
                      </Form>
                    </Card>
                  ),
                },
                {
                  key: "3",
                  label: "Permisos del Rol",
                  children: (
                    <Card style={{ marginTop: 8 }}>
                      <Form
                        form={formPermisos}
                        layout="horizontal"
                        onFinish={onGuardarPermisos}
                      >
                        <Row gutter={[24, 12]}>
                          {Object.entries(etiquetasPermisos).map(
                            ([key, label]) => (
                              <Col xs={24} sm={12} md={8} key={key}>
                                {/* valuePropName='checked' es vital para que Switch funcione con Form */}
                                <Form.Item
                                  name={key}
                                  valuePropName="checked"
                                  style={{ marginBottom: 0 }}
                                >
                                  <Switch
                                    checkedChildren="Sí"
                                    unCheckedChildren="No"
                                  />
                                </Form.Item>
                                <Text style={{ marginLeft: 8 }}>{label}</Text>
                              </Col>
                            ),
                          )}
                        </Row>
                        <Divider />
                        <Row justify="end">
                          <Button type="primary" htmlType="submit">
                            Guardar Permisos
                          </Button>
                        </Row>
                      </Form>
                    </Card>
                  ),
                },
              ]}
            />
          </>
        ) : null}
      </Modal>

      {/**Modal Contrato funcionario */}
      <Modal
        title={
          <Space>
            <FileTextOutlined style={{ fontSize: 18 }} />
            <span>Contrato - {contratoSeleccionado?.funcionario?.nombre}</span>
          </Space>
        }
        open={modalContratoVisible}
        onCancel={cerrarModalContrato}
        width={800}
        footer={[
          <Button key="cerrar" onClick={cerrarModalContrato}>
            Cerrar
          </Button>,
        ]}
      >
        {contratoSeleccionado && (
          <>
            {/* Card Colaborador */}
            <Card style={{ marginBottom: 16 }}>
              <Row gutter={24} align="middle">
                <Col xs={24} sm={6} style={{ textAlign: "center" }}>
                  <Avatar
                    size={80}
                    icon={<UserOutlined />}
                    style={{ backgroundColor: "#1890ff" }}
                  >
                    {contratoSeleccionado?.funcionario?.nombre?.charAt(0)}
                    {contratoSeleccionado?.funcionario?.apellido?.charAt(0)}
                  </Avatar>
                </Col>
                <Col xs={24} sm={18}>
                  <Title level={4} style={{ margin: 0, marginBottom: 8 }}>
                    {contratoSeleccionado?.funcionario?.nombre}{" "}
                    {contratoSeleccionado?.funcionario?.apellido}
                  </Title>
                  <Space direction="vertical" size={0}>
                    <Text type="secondary">
                      RUT: {contratoSeleccionado?.funcionario?.rut}
                    </Text>
                    <Text type="secondary">
                      Sucursal: {contratoSeleccionado?.sucursal?.nombre}
                    </Text>
                  </Space>
                  <div style={{ marginTop: 12 }}>
                    <Badge
                      status={
                        contratoSeleccionado?.estado === "Activo"
                          ? "success"
                          : "error"
                      }
                      text={contratoSeleccionado?.estado}
                    />
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Información Personal */}
            <Card title="Información Personal" style={{ marginBottom: 16 }}>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Fecha Ingreso">
                  {contratoSeleccionado?.fechaIngreso
                    ? dayjs(contratoSeleccionado.fechaIngreso).format(
                        "DD/MM/YYYY",
                      )
                    : "Sin información"}
                </Descriptions.Item>
                <Descriptions.Item label="Dirección">
                  {contratoSeleccionado?.sucursal?.direccion || "No informado"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Información Contractual */}
            <Card title="Información Contractual" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ display: "block", marginBottom: 8 }}>
                      Tipo de Contrato
                    </Text>
                    <Tag
                      color={
                        contratoSeleccionado?.tipoContrato === "Indefinido"
                          ? "blue"
                          : contratoSeleccionado?.tipoContrato === "Plazo Fijo"
                            ? "orange"
                            : "purple"
                      }
                    >
                      {contratoSeleccionado?.tipoContrato || "No informado"}
                    </Tag>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ display: "block", marginBottom: 8 }}>
                      Turno
                    </Text>
                    <Tag
                      color={
                        contratoSeleccionado?.turno === "Mañana"
                          ? "blue"
                          : contratoSeleccionado?.turno === "Tarde"
                            ? "orange"
                            : contratoSeleccionado?.turno === "Noche"
                              ? "purple"
                              : "green"
                      }
                    >
                      {contratoSeleccionado?.turno || "No informado"}
                    </Tag>
                  </div>
                </Col>
              </Row>

              <Descriptions column={1} size="small">
                <Descriptions.Item label="Sucursal">
                  {contratoSeleccionado?.sucursal?.nombre || "No informado"}
                </Descriptions.Item>
                <Descriptions.Item label="Estado Sucursal">
                  <Badge
                    status={
                      contratoSeleccionado?.sucursal?.estado === "Activo"
                        ? "success"
                        : "error"
                    }
                    text={contratoSeleccionado?.sucursal?.estado}
                  />
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </>
        )}
      </Modal>

      {/**Modal Editar Turno */}
      <Modal
        title="Editar turno"
        open={modalEditarTurnoVisible}
        onOk={() => formEditarTurno.submit()}
        onCancel={cerrarModalEditarTurno}
        okText="Guardar cambios"
        cancelText="Cancelar"
      >
        <Form
          form={formEditarTurno}
          layout="vertical"
          onFinish={handleSubmitEditarTurno}
        >
          <Card style={{ marginBottom: 16 }}>
            <Space direction="vertical" size={0}>
              <Text strong>
                {contratoTurnoEditando?.funcionario?.nombre || "-"}{" "}
                {contratoTurnoEditando?.funcionario?.apellido || ""}
              </Text>
              <Text type="secondary">
                RUT: {contratoTurnoEditando?.funcionario?.rut || "-"}
              </Text>
              <Text type="secondary">
                Sucursal: {contratoTurnoEditando?.sucursal?.nombre || "-"}
              </Text>
            </Space>
          </Card>
          <Form.Item
            name="idContratoFuncionario"
            hidden
            initialValue={contratoTurnoEditando?.idContratoFuncionario}
          >
            <Input type="hidden" />
          </Form.Item>

          <Form.Item
            name="turno"
            label="Turno"
            rules={[{ required: true, message: "Seleccione el turno" }]}
          >
            <Select placeholder="Seleccione un turno">
              <Option value="Mañana">Mañana</Option>
              <Option value="Tarde">Tarde</Option>
              <Option value="Noche">Noche</Option>
              <Option value="Rotativo">Rotativo</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/**Modal Editar Contrato (frontend-only) */}
      <Modal
        title="Editar Contrato"
        open={modalEditarContratoVisible}
        onOk={() => formEditarContrato.submit()}
        onCancel={cerrarModalEditarContrato}
        okText="Guardar cambios"
        cancelText="Cancelar"
        width={700}
      >
        <Form
          form={formEditarContrato}
          layout="vertical"
          onFinish={handleSubmitEditarContrato}
        >
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="rutBuscar"
                label="Buscar funcionario por RUT"
                getValueFromEvent={(event) =>
                  formatearRutNumerico(event?.target?.value)
                }
              >
                <Input.Search
                  placeholder="Ej: 12345678-9"
                  maxLength={10}
                  enterButton="Buscar"
                  onSearch={(value) =>
                    handleBuscarFuncionarioPorRut(formatearRutNumerico(value))
                  }
                />
              </Form.Item>

              <Form.Item label="Funcionario" shouldUpdate>
                <Input
                  value={
                    funcionarioBuscado
                      ? `${funcionarioBuscado.nombre} ${funcionarioBuscado.apellido} - ${funcionarioBuscado.rut}`
                      : "Ninguno seleccionado"
                  }
                  disabled
                />
              </Form.Item>

              <Form.Item
                name="nuevoContrato"
                label="Modalidad de Contrato"
                rules={[
                  {
                    required: true,
                    message: "Seleccione la modalidad de contrato",
                  },
                ]}
              >
                <Select placeholder="Seleccione un nuevo contrato">
                  <Option value="Indefinido">Indefinido</Option>
                  <Option value="Plazo Fijo">Plazo Fijo</Option>
                  <Option value="Honorarios">Honorarios</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="motivo"
                label="Motivo"
                rules={[{ required: true, message: "Ingrese motivo" }]}
              >
                <TextArea rows={3} placeholder="Motivo del cambio" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Card size="small">
                <Text strong>Resumen</Text>
                <div style={{ marginTop: 12 }}>
                  <div>
                    <Text type="secondary">Contrato: </Text>
                    <div>{funcionarioBuscado?.tipoContrato || "-"}</div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">Sucursal: </Text>
                    <div>{funcionarioBuscado?.sucursal || "-"}</div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/**Modal Nuevo Contrato */}
      {/* <Modal
        title="Nuevo Contrato"
        open={modalCrearContrato}
        okText="Crear Contrato"
        onOk={() => formContrato.submit()}
        onCancel={() => cerrarModalCrearContrato()}
        width={600}
      >
        <Form
          form={formContrato}
          layout="vertical"
          onFinish={handleSubmitContrato}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="estadoContrato"
                label="Estado del Contrato"
                rules={[
                  {
                    required: true,
                    message: "Seleccione el estado del contrato",
                  },
                ]}
                initialValue="Activo"
              >
                <Select placeholder="Seleccione el estado" disabled>
                  <Option value="Activo">Activo</Option>
                  <Option value="Inactivo">Inactivo</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="fechaIngreso"
                label="Fecha de Ingreso"
                rules={[
                  { required: true, message: "Seleccione la fecha de ingreso" },
                ]}
                initialValue={dayjs()}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder={dayjs().format("DD/MM/YYYY")}
                  disabled
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="rutFuncionario"
                label="Funcionario"
                initialValue={contratoSeleccionado?.funcionario?.rut}
                rules={[
                  {
                    required: true,
                    message: "Seleccione un funcionario",
                  },
                ]}
              >
                <Select
                  placeholder="Seleccione un funcionario"
                  notFoundContent="No hay funcionarios sin contrato"
                >
                  {funcionariosSinContrato.map((funcionario) => (
                    <Option
                      key={funcionario.idFuncionario}
                      value={funcionario.rut}
                    >
                      {funcionario.nombre} {funcionario.apellido} -{" "}
                      {funcionario.rut}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="idSucursal"
                label="Sucursal"
                rules={[{ required: true, message: "Seleccione la sucursal" }]}
              >
                <Select placeholder="Seleccione una sucursal">
                  {sucursales.map((sucursal) => (
                    <Option
                      key={sucursal.idSucursal}
                      value={sucursal.idSucursal}
                    >
                      {sucursal.nombre}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="tipoContrato"
            label="Tipo de Contrato"
            rules={[
              { required: true, message: "Seleccione el tipo de contrato" },
            ]}
          >
            <Select placeholder="Seleccione tipo de contrato">
              <Option value="Indefinido">Indefinido</Option>
              <Option value="Plazo Fijo">Plazo Fijo</Option>
              <Option value="Honorarios">Honorarios</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="turno"
            label="Turno"
            rules={[{ required: true, message: "Seleccione el turno" }]}
          >
            <Select placeholder="Seleccione un turno">
              <Option value="Mañana">Mañana </Option>
              <Option value="Tarde">Tarde</Option>
              <Option value="Noche">Noche</Option>
              <Option value="Rotativo">Rotativo</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal> */}
    </div>
  );
};

export default GestionColaborador;
