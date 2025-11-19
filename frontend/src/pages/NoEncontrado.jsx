// NotFound.jsx
import { useNavigate } from "react-router-dom";
import { Button, Result } from "antd";

const NoEncontrado = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title="404"
      subTitle="Lo sentimos, la página que visitaste no existe."
      extra={
        <Button type="primary" onClick={() => navigate("/")}>
          Volver al inicio
        </Button>
      }
    />
  );
};

export default NoEncontrado;
