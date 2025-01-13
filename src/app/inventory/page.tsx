"use client";

import {
  Card,
  Col,
  Row,
  Typography,
  Layout,
  Menu,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Select,
  Collapse,
  Divider,
  Space,
} from "antd";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";

const { Title, Paragraph, Text } = Typography;
const { Header, Content, Footer } = Layout;
const { Panel } = Collapse;

export default function MedicalInventory() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState<any>(null);
  const [form] = Form.useForm();

  const [filter, setFilter] = useState({
    brand: "",
    name: "",
    supplier: "",
    expirationDate: null,
  });

  const menuItems = [
    { label: "Home", key: "home" },
    { label: "Appointment", key: "appointment" },
    { label: "Client", key: "client" },
    { label: "Pet Patient", key: "pet" },
    { label: "Lab Diagnostic", key: "lab" },
    { label: "Medical Inventory", key: "inventory" },
  ];

  const handleMenuClick = (e: { key: string }) => {
    switch (e.key) {
      case "home":
        router.push("/");
        break;
      case "appointment":
        router.push("/appointment");
        break;
      case "client":
        router.push("/client");
        break;
      case "pet":
        router.push("/pet");
        break;
      case "lab":
        router.push("/lab-diagnostic");
        break;
      case "inventory":
        router.push("/inventory");
        break;
      default:
        router.push("/");
        break;
    }
  };

  useEffect(() => {
    axios
      .get("http://localhost:8080/medical")
      .then((response) => {
        setAppointments(response.data);
      })
      .catch((error) => {
        message.error("Failed to load medical inventories.");
      });
  }, []);

  useEffect(() => {
    const filtered = appointments.filter((appointment) => {
      const matchesBrand =
        !filter.brand ||
        appointment.brand.toLowerCase().includes(filter.brand.toLowerCase());
      const matchesName =
        !filter.name ||
        appointment.name.toLowerCase().includes(filter.name.toLowerCase());
      const matchesSupplier =
        !filter.supplier ||
        appointment.supplier
          .toLowerCase()
          .includes(filter.supplier.toLowerCase());
      const matchesExpirationDate =
        !filter.expirationDate ||
        (filter.expirationDate &&
          dayjs(appointment.expirationDate).isSame(
            filter.expirationDate,
            "day"
          ));

      return (
        matchesBrand && matchesName && matchesSupplier && matchesExpirationDate
      );
    });
    setFilteredAppointments(filtered);
  }, [appointments, filter]);

  const handleModalOk = () => {
    const values = form.getFieldsValue();

    const expirationDate = values.expirationDate
      ? values.expirationDate.format("YYYY-MM-DD")
      : "";

    values.expirationDate = expirationDate;

    const apiRequest = isEditing
      ? axios.put(
          `http://localhost:8080/medical/update?documentId=${currentAppointment?.documentId}`,
          values
        )
      : axios.post("http://localhost:8080/medical/create", values);

    apiRequest
      .then(() => {
        axios
          .get("http://localhost:8080/medical")
          .then((response) => {
            setAppointments(response.data);
            message.success(
              isEditing
                ? "Medicine updated successfully"
                : "Medicine added successfully"
            );
          })
          .catch(() => message.error("Failed to load medical inventories"));
      })
      .catch(() =>
        message.error(
          isEditing ? "Failed to update medicine" : "Failed to add medicine"
        )
      );

    setIsModalVisible(false);
  };

  const handleDelete = (documentId: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this medicine record?",
      content: "Once deleted, this action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      width: 800,
      cancelText: "Cancel",
      onOk: () => {
        axios
          .delete(
            `http://localhost:8080/medical/delete?documentId=${documentId}`
          )
          .then(() => {
            axios
              .get("http://localhost:8080/medical")
              .then((response) => {
                setAppointments(response.data);
                message.success("Lab diagnostic deleted successfully");
              })
              .catch(() =>
                message.error("Failed to load medicine inventories")
              );
          })
          .catch(() => message.error("Failed to delete medicine inventories"));
      },
      onCancel() {
        console.log("Delete action canceled");
      },
    });
  };

  const handleEdit = (record: any) => {
    setIsEditing(true);
    setCurrentAppointment(record);

    const formattedDate = dayjs(record.expirationDate);

    form.setFieldsValue({
      ...record,
      expirationDate: formattedDate,
    });

    setIsModalVisible(true);
  };

  const handleAdd = () => {
    setIsEditing(false);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ background: "#fff", padding: "0 50px 0px 50px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Title
            level={4}
            style={{
              margin: 0,
              flexShrink: 1,
              paddingRight: "271px",
            }}
          >
            Veterinary Clinic Management
          </Title>
          <Menu
            mode="horizontal"
            defaultSelectedKeys={["inventory"]}
            onClick={handleMenuClick}
            style={{
              flexGrow: 1,
              lineHeight: "64px",
              whiteSpace: "nowrap",
            }}
            items={menuItems}
          />
        </div>
      </Header>

      <Content style={{ padding: "50px 50px" }}>
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16} justify="space-between" align="middle">
            <Col span={5}>
              <Input
                placeholder="Brand"
                value={filter.brand}
                onChange={(e) => handleFilterChange("brand", e.target.value)}
              />
            </Col>
            <Col span={5}>
              <Input
                placeholder="Name"
                value={filter.name}
                onChange={(e) => handleFilterChange("name", e.target.value)}
              />
            </Col>
            <Col span={5}>
              <Input
                placeholder="Supplier"
                value={filter.supplier}
                onChange={(e) => handleFilterChange("supplier", e.target.value)}
              />
            </Col>
            <Col span={5}>
              <DatePicker
                placeholder="Expiration Date"
                value={filter.expirationDate}
                onChange={(date) => handleFilterChange("expirationDate", date)}
                style={{ width: "100%" }}
              />
            </Col>
            <Col span={4} style={{ textAlign: "right" }}>
              <Button type="primary" onClick={handleAdd}>
                Add Medicine
              </Button>
            </Col>
          </Row>
        </div>

        <Row gutter={16}>
          {filteredAppointments.map((appointment) => (
            <Col span={8} key={appointment.documentId} style={{paddingBottom: "16px"}}>
              <Card
                title={appointment.date}
                bordered={false}
                style={{ width: "100%"}}
                actions={[
                  <Button type="link" onClick={() => handleEdit(appointment)}>
                    Edit
                  </Button>,
                  <Button
                    type="link"
                    danger
                    onClick={() => handleDelete(appointment.documentId)}
                  >
                    Delete
                  </Button>,
                ]}
              >
                <section>
                  <Title
                    level={4}
                  >{`${appointment.brand} - ${appointment.name}`}</Title>
                  <Row gutter={[0, 8]}>
                    <Col span={24}>
                      <Text strong>Brand:</Text> {appointment.brand}
                    </Col>
                    <Col span={24}>
                      <Text strong>Name:</Text> {appointment.name}
                    </Col>
                    <Col span={24}>
                      <Text strong>Supplier:</Text> {appointment.supplier}
                    </Col>
                    <Col span={24}>
                      <Text strong>Quantity:</Text> {appointment.quantity}
                    </Col>
                    <Col span={24}>
                      <Text strong>Unit Price:</Text> {appointment.unitPrice}
                    </Col>
                    <Col span={24}>
                      <Text strong>Expiration date:</Text>{" "}
                      {appointment.expirationDate}
                    </Col>
                  </Row>
                </section>
              </Card>
            </Col>
          ))}
        </Row>

        <Modal
          title={isEditing ? "Edit Medicine" : "Add Medicine"}
          open={isModalVisible}
          onOk={() => form.submit()}
          onCancel={() => setIsModalVisible(false)}
          width={800}
          style={{ top: 20 }}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{}}
            onFinish={handleModalOk}
          >
            <Collapse defaultActiveKey={["1", "2"]}>
              <Panel header="Medicine Info" key="1">
                <Form.Item
                  label="Brand"
                  name="brand"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the medicine brand",
                    },
                  ]}
                >
                  <Input placeholder="Medicine brand" />
                </Form.Item>
                <Form.Item
                  label="Medicine Name"
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the medicine name",
                    },
                  ]}
                >
                  <Input placeholder="Medicine Name" />
                </Form.Item>
                <Form.Item
                  label="Supplier"
                  name="supplier"
                  rules={[
                    { required: true, message: "Please enter the supplier" },
                  ]}
                >
                  <Input placeholder="Supplier" />
                </Form.Item>
                <Form.Item
                  label="Quantity"
                  name="quantity"
                  rules={[
                    { required: true, message: "Please enter the quantity" },
                  ]}
                >
                  <Input placeholder="Quantity" />
                </Form.Item>
                <Form.Item
                  label="Unit Price"
                  name="unitPrice"
                  rules={[
                    { required: true, message: "Please enter the unit price" },
                  ]}
                >
                  <Input placeholder="Unit Price" />
                </Form.Item>
                <Form.Item
                  label="Expiration Date"
                  name="expirationDate"
                  rules={[
                    {
                      required: true,
                      message: "Please select the expiration date",
                    },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Panel>
            </Collapse>
          </Form>
        </Modal>
      </Content>

      <Footer style={{ textAlign: "center" }}>
        Veterinary Clinic Management System ©2025
      </Footer>
    </Layout>
  );
}
