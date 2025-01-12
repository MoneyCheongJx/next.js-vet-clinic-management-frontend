"use client";

import {
  Card,
  Col,
  Row,
  Typography,
  Layout,
  Menu,
  Collapse,
  Select,
} from "antd";
import { Table, Button, Modal, Form, Input, DatePicker, message } from "antd";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import dayjs from "dayjs";

const { Title, Paragraph } = Typography;
const { Header, Content, Footer } = Layout;
const { Panel } = Collapse;

export default function Client() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState<any>(null);
  const [form] = Form.useForm();

  const [filter, setFilter] = useState({
    fullname: "",
    phoneNumber: "",
    email: "",
    gender: "",
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
      .get("http://localhost:8080/client")
      .then((response) => {
        setAppointments(response.data);
      })
      .catch((error) => {
        message.error("Failed to load clients.");
      });
  }, []);

  useEffect(() => {
    const filtered = appointments.filter((appointment) => {
      const matchesFullname =
        !filter.fullname ||
        appointment.fullname
          .toLowerCase()
          .includes(filter.fullname.toLowerCase());
      const matchesPhoneNumber =
        !filter.phoneNumber ||
        appointment.phoneNumber
          .toLowerCase()
          .includes(filter.phoneNumber.toLowerCase());
      const matchesEmail =
        !filter.email ||
        appointment.email.toLowerCase().includes(filter.email.toLowerCase());
      const matchesGender =
        !filter.gender ||
        (appointment.gender &&
          appointment.gender.toLowerCase() === filter.gender.toLowerCase());
      return (
        matchesFullname && matchesPhoneNumber && matchesEmail && matchesGender
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
          `http://localhost:8080/client/update?documentId=${currentAppointment?.documentId}`,
          values
        )
      : axios.post("http://localhost:8080/client/create", values);

    apiRequest
      .then(() => {
        axios
          .get("http://localhost:8080/client")
          .then((response) => {
            setAppointments(response.data);
            message.success(
              isEditing
                ? "Client updated successfully"
                : "Client added successfully"
            );
          })
          .catch(() => message.error("Failed to load clients"));
      })
      .catch(() =>
        message.error(
          isEditing ? "Failed to update client" : "Failed to add client"
        )
      );

    setIsModalVisible(false);
  };

  const handleDelete = (documentId: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this client record?",
      content: "Once deleted, this action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      width: 800,
      cancelText: "Cancel",
      onOk: () => {
        axios
          .delete(
            `http://localhost:8080/client/delete?documentId=${documentId}`
          )
          .then(() => {
            axios
              .get("http://localhost:8080/client")
              .then((response) => {
                setAppointments(response.data);
                message.success("Client deleted successfully");
              })
              .catch(() => message.error("Failed to load client"));
          })
          .catch(() => message.error("Failed to delete client"));
      },
      onCancel() {
        console.log("Delete action canceled");
      },
    });
  };

  const handleEdit = (record: any) => {
    setIsEditing(true);
    setCurrentAppointment(record);

    form.setFieldsValue(record);

    const appointmentDateTime = dayjs(
      `${record.date} ${record.time}`,
      "YYYY-MM-DD HH:mm"
    );
    form.setFieldsValue({
      ...record,
      appointmentDate: appointmentDateTime,
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

  const columns: ColumnsType<any> = [
    {
      title: "Fullname",
      dataIndex: "fullname",
      key: "fullname",
      align: "center",
      width: 150,
      sorter: (a: any, b: any) =>
        a.ownerFullname.localeCompare(b.ownerFullname),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      align: "center",
      width: 150,
      sorter: (a: any, b: any) => a.petName.localeCompare(b.petName),
    },
    {
      title: "Phone",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      align: "center",
      width: 120,
      sorter: (a: any, b: any) => a.phoneNumber.localeCompare(b.phoneNumber),
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      align: "center",
      width: 100,
      sorter: (a: any, b: any) => a.petType.localeCompare(b.petType),
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
      align: "center",
      width: 100,
      sorter: (a: any, b: any) => a.petType.localeCompare(b.petType),
    },
    {
      title: "Address",
      key: "address",
      width: 200,
      align: "center",
      render: (record: any) => {
        const fullAddress = `${record.address}, ${record.city}, ${record.postalCode}, ${record.state}`;
        return <span>{fullAddress}</span>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      width: 150,
      render: (_: any, record: any) => (
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <Button onClick={() => handleEdit(record)} type="link">
            Edit
          </Button>
          <Button
            onClick={() => handleDelete(record.documentId)}
            type="link"
            danger
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

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
              paddingRight: "291px",
            }}
          >
            Veterinary Clinic Management
          </Title>
          <Menu
            mode="horizontal"
            defaultSelectedKeys={["client"]}
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
                placeholder="Fullname"
                value={filter.fullname}
                onChange={(e) => handleFilterChange("fullname", e.target.value)}
              />
            </Col>
            <Col span={5}>
              <Input
                placeholder="Email"
                value={filter.email}
                onChange={(e) => handleFilterChange("email", e.target.value)}
              />
            </Col>
            <Col span={5}>
              <Input
                placeholder="Phone"
                value={filter.phoneNumber}
                onChange={(e) =>
                  handleFilterChange("phoneNumber", e.target.value)
                }
              />
            </Col>
            <Col span={5}>
              <Select
                placeholder="Select Gender"
                value={filter.gender}
                onChange={(value) => handleFilterChange("gender", value)}
                style={{ width: "100%" }}
              >
                <Select.Option value="">All</Select.Option>
                <Select.Option value="Male">Male</Select.Option>
                <Select.Option value="Female">Female</Select.Option>
              </Select>
            </Col>
            <Col span={4} style={{ textAlign: "right" }}>
              <Button type="primary" onClick={handleAdd}>
                Add Client
              </Button>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={filteredAppointments}
          rowKey="key"
          pagination={false}
        />

        <Modal
          title={isEditing ? "Edit Client" : "Add Client"}
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
            <Collapse defaultActiveKey={["1", "2", "3"]}>
              <Panel header="Client Info" key="1">
                <Form.Item
                  label="Fullname"
                  name="fullname"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the fullname",
                    },
                  ]}
                >
                  <Input placeholder="Fullname" />
                </Form.Item>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Please enter the email" },
                    {
                      type: "email",
                      message: "Please enter a valid email address",
                    },
                  ]}
                >
                  <Input placeholder="Email" />
                </Form.Item>
                <Form.Item
                  label="Phone"
                  name="phoneNumber"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the phone number",
                    },
                  ]}
                >
                  <Input placeholder="Phone" />
                </Form.Item>
                <Form.Item
                  label="Gender"
                  name="gender"
                  rules={[
                    { required: true, message: "Please select the gender" },
                  ]}
                >
                  <Select placeholder="Select gender">
                    <Select.Option value="Male">Male</Select.Option>
                    <Select.Option value="Female">Female</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  label="Age"
                  name="age"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the age",
                    },
                  ]}
                >
                  <Input placeholder="Age" />
                </Form.Item>
                <Form.Item
                  label="Address"
                  name="address"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the address",
                    },
                  ]}
                >
                  <Input placeholder="Address" />
                </Form.Item>
                <Form.Item
                  label="City"
                  name="city"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the city",
                    },
                  ]}
                >
                  <Input placeholder="City" />
                </Form.Item>
                <Form.Item
                  label="Postal code"
                  name="postalCode"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the postal code",
                    },
                  ]}
                >
                  <Input placeholder="Postal code" />
                </Form.Item>
                <Form.Item
                  label="State"
                  name="state"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the state",
                    },
                  ]}
                >
                  <Input placeholder="State" />
                </Form.Item>
              </Panel>
            </Collapse>
          </Form>
        </Modal>
      </Content>

      <Footer style={{ textAlign: "center" }}>
        <p>
          &copy; {new Date().getFullYear()} Veterinary Clinic. All Rights
          Reserved.
        </p>
      </Footer>
    </Layout>
  );
}
