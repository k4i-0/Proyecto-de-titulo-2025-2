import React from "react";
import { Row, Col, Typography, Space } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function VendedorPageHeader({
  title,
  description,
  icon,
  extra,
}) {
  const now = new Date();

  return (
    <div style={{ marginBottom: 24 }}>
      <Row justify="space-between" align="middle" gutter={[16, 16]}>
        <Col flex="auto">
          <Title level={2} style={{ margin: 0, marginBottom: 4 }}>
            <Space size={10}>
              {icon}
              <span>{title}</span>
            </Space>
          </Title>

          <Text type="secondary" style={{ fontSize: "16px" }}>
            <ClockCircleOutlined style={{ marginRight: 8 }} />
            {description}
            {description ? " - " : ""}
            {now.toLocaleDateString("es-CL", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            - {now.toLocaleTimeString("es-CL")}
          </Text>
        </Col>

        {extra && <Col>{extra}</Col>}
      </Row>
    </div>
  );
}
