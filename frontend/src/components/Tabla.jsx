import React, { useState, useMemo } from "react";
import {
  Table,
  Input,
  Select,
  Button,
  Row,
  Col,
  Space,
  Card,
  Typography,
} from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";

const { Text } = Typography;

/**
 * @param {Array} data - Array de objetos con los datos a mostrar.
 * @param {Array} columns - Definición de columnas de Ant Design.
 * @param {Boolean} loading - Estado de carga.
 * @param {String} rowKey - Nombre de la propiedad única (ej: "idProveedor").
 * @param {Array} searchableFields - Campos donde buscar con el input de texto (ej: ["nombre", "rut"]).
 * @param {Array} filterConfig - Configuración de filtros dropdown.
 * Ejemplo: [{ key: 'estado', placeholder: 'Estado', options: [{value: 'Activo', label: 'Activo'}] }]
 * @param {Function} onRowClick - Función al hacer click en una fila (opcional).
 * @param {ReactNode} headerButtons - Botones extra para la cabecera (Actualizar, Agregar, etc).
 * @param {Boolean} pagination - Habilitar paginación (default: true).
 * @param {Function} summaryRow - Función para renderizar fila de resumen (opcional).
 * @param {String} title - Título de la página (opcional).
 * @param {String} description - Descripción de la página (opcional).
 * @param {Object} selectedRow - Fila seleccionada actualmente (opcional).
 */
export default function DataTable({
  data = [],
  columns = [],
  loading = false,
  rowKey = "id",
  searchableFields = [],
  filterConfig = [],
  onRowClick,
  headerButtons,
  pagination = true,
  summaryRow = null,
  title,
  description,
  selectedRow,
}) {
  const [searchText, setSearchText] = useState("");
  // Estado para manejar múltiples filtros dinámicos { estado: "Activo", rubro: "Tecnologia" }
  const [activeFilters, setActiveFilters] = useState({});

  // Lógica de Filtrado Unificada
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // 1. Filtrado por Buscador de Texto (SearchText)
      const matchesSearch =
        !searchText ||
        searchableFields.some((field) => {
          const fieldValue = item[field]?.toString().toLowerCase();
          return fieldValue?.includes(searchText.toLowerCase());
        });

      // 2. Filtrado por Dropdowns dinámicos
      const matchesFilters = filterConfig.every((config) => {
        const selectedValue = activeFilters[config.key];
        // Si no hay nada seleccionado en este filtro, pasa. Si hay, debe coincidir.
        return !selectedValue || item[config.key] === selectedValue;
      });

      return matchesSearch && matchesFilters;
    });
  }, [data, searchText, activeFilters, searchableFields, filterConfig]);

  // Manejadores de cambios
  const handleFilterChange = (key, value) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleLimpiarFiltros = () => {
    setSearchText("");
    setActiveFilters({});
  };

  return (
    <>
      {/* Header Moderno (Opcional) */}
      {title && (
        <div
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)",
            padding: "32px",
            borderRadius: "12px",
            marginBottom: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Typography.Title
                level={2}
                style={{ margin: 0, marginBottom: 8, color: "#1890ff" }}
              >
                {title}
              </Typography.Title>
              {description && (
                <Text style={{ fontSize: "15px", color: "rgba(0,0,0,0.65)" }}>
                  {description}
                </Text>
              )}
            </Col>
            {/* {headerButtons && <Col>{headerButtons}</Col>} */}
          </Row>
        </div>
      )}

      {/* Card con Tabla */}
      <Card
        className="card-modern"
        style={{
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        {/* 1. Botones de Acción (Header) */}
        {headerButtons && (
          <Row
            justify="space-between"
            align="middle"
            style={{ marginBottom: 16 }}
          >
            <Col span={24}>{headerButtons}</Col>
          </Row>
        )}

        {/* 2. Barra de Filtros */}
        <Row
          justify="start"
          align="middle"
          gutter={[16, 16]}
          style={{ marginBottom: 16 }}
        >
          {/* Buscador General */}
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Buscar..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>

          {/* Filtros Dinámicos (Dropdowns) */}
          {filterConfig.map((filter) => (
            <Col xs={12} sm={6} md={4} key={filter.key}>
              <Select
                placeholder={filter.placeholder}
                style={{ width: "100%" }}
                value={activeFilters[filter.key]}
                onChange={(value) => handleFilterChange(filter.key, value)}
                allowClear
                options={filter.options}
              />
            </Col>
          ))}

          {/* Botón Limpiar */}
          <Col xs={12} sm={6} md={4}>
            <Button
              icon={<FilterOutlined />}
              onClick={handleLimpiarFiltros}
              block
              disabled={!searchText && Object.keys(activeFilters).length === 0}
            >
              Limpiar
            </Button>
          </Col>

          {/* Contador de resultados */}
          {(searchText || Object.keys(activeFilters).length > 0) && (
            <Col span={24}>
              <Text type="secondary">
                Mostrando {filteredData.length} de {data.length} registros
              </Text>
            </Col>
          )}
        </Row>

        {/* 3. Tabla Ant Design */}
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey={rowKey}
          loading={loading}
          bordered
          size="middle"
          pagination={
            pagination
              ? {
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} registros`,
                }
              : false
          }
          onRow={(record) => ({
            onClick: () => onRowClick && onRowClick(record),
            style: {
              cursor: onRowClick ? "pointer" : "default",
              backgroundColor:
                selectedRow && selectedRow[rowKey] === record[rowKey]
                  ? "#e6f7ff"
                  : "transparent",
              transition: "background-color 0.3s ease",
            },
          })}
          summary={summaryRow}
        />
      </Card>
    </>
  );
}
