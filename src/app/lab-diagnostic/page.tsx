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

export default function LabDiagnostic() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState<any>(null);
  const [form] = Form.useForm();

  const [filter, setFilter] = useState({
    petOwner: "",
    petName: "",
    petType: "",
    diagnosticTest: "",
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
      .get("http://localhost:8080/lab")
      .then((response) => {
        setAppointments(response.data);
      })
      .catch((error) => {
        message.error("Failed to load labs.");
      });
  }, []);

  useEffect(() => {
    const filtered = appointments.filter((appointment) => {
      const matchesPetOwner =
        !filter.petOwner ||
        appointment.ownerFullname
          .toLowerCase()
          .includes(filter.petOwner.toLowerCase());
      const matchesPetName =
        !filter.petName ||
        appointment.petName
          .toLowerCase()
          .includes(filter.petName.toLowerCase());
      const matchesPetType =
        !filter.petType ||
        appointment.petType.toLowerCase() === filter.petType.toLowerCase();
      const matchesDiagnosticTest =
        !filter.diagnosticTest ||
        appointment.diagnosticTest
          .toLowerCase()
          .includes(filter.diagnosticTest.toLowerCase());

      return (
        matchesPetOwner &&
        matchesPetName &&
        matchesPetType &&
        matchesDiagnosticTest
      );
    });
    setFilteredAppointments(filtered);
  }, [appointments, filter]);

  const handleModalOk = () => {
    const values = form.getFieldsValue();

    const appointmentDateTime = values.appointmentDate;
    const date = appointmentDateTime
      ? appointmentDateTime.format("YYYY-MM-DD")
      : "";
    const time = appointmentDateTime ? appointmentDateTime.format("HH:mm") : "";
    values.date = date;
    values.time = time;

    const apiRequest = isEditing
      ? axios.put(
          `http://localhost:8080/lab/update?documentId=${currentAppointment?.documentId}`,
          values
        )
      : axios.post("http://localhost:8080/lab/create", values);

    apiRequest
      .then(() => {
        axios
          .get("http://localhost:8080/lab")
          .then((response) => {
            setAppointments(response.data);
            message.success(
              isEditing
                ? "Lab diagnostic updated successfully"
                : "Lab diagnostic added successfully"
            );
          })
          .catch(() => message.error("Failed to load lab diagnostic"));
      })
      .catch(() =>
        message.error(
          isEditing
            ? "Failed to update lab diagnostic"
            : "Failed to add lab diagnostic"
        )
      );

    setIsModalVisible(false);
  };

  const handleDelete = (documentId: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this lab diagnostic record?",
      content: "Once deleted, this action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      width: 800,
      cancelText: "Cancel",
      onOk: () => {
        axios
          .delete(`http://localhost:8080/lab/delete?documentId=${documentId}`)
          .then(() => {
            axios
              .get("http://localhost:8080/lab")
              .then((response) => {
                setAppointments(response.data);
                message.success("Lab diagnostic deleted successfully");
              })
              .catch(() => message.error("Failed to load lab diagnostic"));
          })
          .catch(() => message.error("Failed to delete lab diagnosic"));
      },
      onCancel() {
        console.log("Delete action canceled");
      },
    });
  };

  const handleEdit = (record: any) => {
    setIsEditing(true);
    setCurrentAppointment(record);

    const formattedDate = dayjs(record.appointmentDate);

    form.setFieldsValue({
      ...record,
      appointmentDate: formattedDate,
    });

    setIsModalVisible(true);
  };

  const handleAdd = () => {
    setIsEditing(false);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleFilterChange = (key: string, value: string) => {
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
            defaultSelectedKeys={["lab"]}
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
                placeholder="Pet Owner"
                value={filter.petOwner}
                onChange={(e) => handleFilterChange("petOwner", e.target.value)}
              />
            </Col>
            <Col span={5}>
              <Input
                placeholder="Pet Name"
                value={filter.petName}
                onChange={(e) => handleFilterChange("petName", e.target.value)}
              />
            </Col>
            <Col span={5}>
              <Select
                placeholder="Pet Type"
                value={filter.petType}
                onChange={(value) => handleFilterChange("petType", value)}
                style={{ width: "100%" }}
              >
                <Select.Option value="">All</Select.Option>
                <Select.Option value="Dog">Dog</Select.Option>
                <Select.Option value="Cat">Cat</Select.Option>
                <Select.Option value="Bird">Bird</Select.Option>
              </Select>
            </Col>
            <Col span={5}>
              <Input
                placeholder="Diagnostic Test"
                value={filter.diagnosticTest}
                onChange={(e) =>
                  handleFilterChange("diagnosticTest", e.target.value)
                }
              />
            </Col>
            <Col span={4} style={{ textAlign: "right" }}>
              <Button type="primary" onClick={handleAdd}>
                Add Lab Diagnostic
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
                style={{ width: "100%" }}
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
                  <Title level={4}>Pet Info</Title>
                  <Row gutter={[0, 8]}>
                    <Col span={24}>
                      <Text strong>Pet Owner:</Text> {appointment.ownerFullname}
                    </Col>
                    <Col span={24}>
                      <Text strong>Pet Name:</Text> {appointment.petName}
                    </Col>
                    <Col span={24}>
                      <Text strong>Pet Gender:</Text> {appointment.petGender}
                    </Col>
                    <Col span={24}>
                      <Text strong>Pet Type:</Text> {appointment.petType}
                    </Col>
                    <Col span={24}>
                      <Text strong>Pet Age:</Text> {appointment.age}
                    </Col>
                  </Row>
                </section>

                <Divider />

                <section>
                  <Title level={4}>Diagnostic Info</Title>
                  <Row gutter={[0, 8]}>
                    <Col span={24}>
                      <Text strong>Type of diagnostic test:</Text>{" "}
                      {appointment.diagnosticTest}
                    </Col>
                    <Col span={24}>
                      <Text strong>Result:</Text> {appointment.result}
                    </Col>
                  </Row>
                </section>
              </Card>
            </Col>
          ))}
        </Row>

        <Modal
          title={isEditing ? "Edit Lab Diagnostic" : "Add Lab Diagnostic"}
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
              <Panel header="Pet Info" key="1">
                <Form.Item
                  label="Pet Owner Fullname"
                  name="ownerFullname"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the pet owner's fullname",
                    },
                  ]}
                >
                  <Input placeholder="Pet Owner Fullname" />
                </Form.Item>
                <Form.Item
                  label="Pet Name"
                  name="petName"
                  rules={[
                    { required: true, message: "Please enter the pet name" },
                  ]}
                >
                  <Input placeholder="Pet Name" />
                </Form.Item>
                <Form.Item
                  label="Pet Gender"
                  name="petGender"
                  rules={[
                    {
                      required: true,
                      message: "Please select the pet's gender",
                    },
                  ]}
                >
                  <Select placeholder="Select pet gender">
                    <Select.Option value="Male">Male</Select.Option>
                    <Select.Option value="Female">Female</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  label="Pet Type"
                  name="petType"
                  rules={[
                    { required: true, message: "Please select the pet type" },
                  ]}
                >
                  <Select placeholder="Select pet type">
                    <Select.Option value="Dog">Dog</Select.Option>
                    <Select.Option value="Cat">Cat</Select.Option>
                    <Select.Option value="Bird">Bird</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  label="Pet Age"
                  name="age"
                  rules={[
                    { required: true, message: "Please enter the pet's age" },
                  ]}
                >
                  <Input placeholder="Pet Age" />
                </Form.Item>
              </Panel>

              <Panel header="Lab Diagnostic Info" key="2">
                <Form.Item
                  label="Diagnostic Test Type"
                  name="diagnosticTest"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the diagnostic test type",
                    },
                  ]}
                >
                  <Input placeholder="Diagnostic Test Type" />
                </Form.Item>
                <Form.Item
                  label="Test Result"
                  name="result"
                  rules={[
                    { required: true, message: "Please enter the test result" },
                  ]}
                >
                  <Input placeholder="Test Result" />
                </Form.Item>
                <Form.Item
                  label="Test Date"
                  name="appointmentDate"
                  rules={[
                    {
                      required: true,
                      message: "Please select the test date",
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
