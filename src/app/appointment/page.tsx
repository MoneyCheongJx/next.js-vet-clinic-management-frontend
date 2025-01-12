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

export default function Home() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState<any>(null);
  const [form] = Form.useForm();

  const [filter, setFilter] = useState({
    ownerName: "",
    phoneNumber: "",
    petName: "",
    petType: "",
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
      .get("http://localhost:8080/appointment")
      .then((response) => {
        setAppointments(response.data);
      })
      .catch((error) => {
        message.error("Failed to load appointments.");
      });
  }, []);

  useEffect(() => {
    const filtered = appointments.filter((appointment) => {
      const matchesOwnerName =
        !filter.ownerName ||
        appointment.ownerFullname
          .toLowerCase()
          .includes(filter.ownerName.toLowerCase());
      const matchesPhoneNumber =
        !filter.phoneNumber ||
        appointment.phoneNumber
          .toLowerCase()
          .includes(filter.phoneNumber.toLowerCase());
      const matchesPetName =
        !filter.petName ||
        appointment.petName
          .toLowerCase()
          .includes(filter.petName.toLowerCase());
      const matchesPetType =
        !filter.petType ||
        appointment.petType
          .toLowerCase()
          .includes(filter.petType.toLowerCase());

      return (
        matchesOwnerName &&
        matchesPhoneNumber &&
        matchesPetName &&
        matchesPetType
      );
    });

    setFilteredAppointments(filtered);
  }, [filter, appointments]);

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
          `http://localhost:8080/appointment/update?documentId=${currentAppointment?.documentId}`,
          values
        )
      : axios.post("http://localhost:8080/appointment/book", values);

    apiRequest
      .then(() => {
        // After successful create/edit, re-fetch appointments
        axios
          .get("http://localhost:8080/appointment")
          .then((response) => {
            setAppointments(response.data); // Update state with the latest appointments
            message.success(
              isEditing
                ? "Appointment updated successfully"
                : "Appointment added successfully"
            );
          })
          .catch(() => message.error("Failed to load appointments"));
      })
      .catch(() =>
        message.error(
          isEditing
            ? "Failed to update appointment"
            : "Failed to add appointment"
        )
      );

    setIsModalVisible(false);
  };

  const handleDelete = (key: string) => {
    const appointmentToDelete = appointments.find(
      (appointment) => appointment.key === key
    );
    if (!appointmentToDelete) return;

    Modal.confirm({
      title: "Are you sure you want to delete this appointment record?",
      content: "Once deleted, this action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      width: 800,
      cancelText: "Cancel",
      onOk: () => {
        axios
          .delete(
            `http://localhost:8080/appointment/delete?documentId=${appointmentToDelete.documentId}`
          )
          .then(() => {
            axios
              .get("http://localhost:8080/appointment")
              .then((response) => {
                setAppointments(response.data);
                message.success("Appointment deleted successfully");
              })
              .catch(() => message.error("Failed to load appointments"));
          })
          .catch(() => message.error("Failed to delete appointment"));
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
      title: "Owner",
      dataIndex: "ownerFullname",
      key: "ownerFullname",
      align: "center",
      width: 150,
      sorter: (a: any, b: any) =>
        a.ownerFullname.localeCompare(b.ownerFullname),
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
      title: "Pet Name",
      dataIndex: "petName",
      key: "petName",
      align: "center",
      width: 150,
      sorter: (a: any, b: any) => a.petName.localeCompare(b.petName),
    },
    {
      title: "Pet Type",
      dataIndex: "petType",
      key: "petType",
      align: "center",
      width: 150,
      sorter: (a: any, b: any) => a.petType.localeCompare(b.petType),
    },
    {
      title: "Appointment",
      key: "appointmentDateTime",
      width: 200,
      align: "center",
      render: (record: any) => {
        const dateTime = `${record.date} ${record.time}`;
        return <span>{dateTime}</span>;
      },
      sorter: (a: any, b: any) => {
        const dateTimeA = new Date(`${a.date} ${a.time}`).getTime();
        const dateTimeB = new Date(`${b.date} ${b.time}`).getTime();
        return dateTimeA - dateTimeB; // Compare datetime values
      },
    },
    {
      title: "Purpose",
      dataIndex: "purpose",
      key: "purpose",
      align: "center",
      width: 200,
      sorter: (a: any, b: any) => a.purpose.localeCompare(b.purpose),
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
          <Button onClick={() => handleDelete(record.key)} type="link" danger>
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
            defaultSelectedKeys={["appointment"]}
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
                placeholder="Owner"
                value={filter.ownerName}
                onChange={(e) =>
                  handleFilterChange("ownerName", e.target.value)
                }
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
              <Input
                placeholder="Pet Name"
                value={filter.petName}
                onChange={(e) => handleFilterChange("petName", e.target.value)}
              />
            </Col>
            <Col span={5}>
              <Select
                placeholder="Select Pet Type"
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
            <Col span={4} style={{ textAlign: "right" }}>
              <Button type="primary" onClick={handleAdd}>
                Add Appointment
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
          title={isEditing ? "Edit Appointment" : "Add Appointment"}
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
              <Panel header="Owner Info" key="1">
                <Form.Item
                  label="Pet Owner Fullname"
                  name="ownerFullname"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the pet owner fullname",
                    },
                  ]}
                >
                  <Input placeholder="Pet owner fullname" />
                </Form.Item>
                <Form.Item
                  label="Pet Owner Email"
                  name="email"
                  rules={[
                    { required: true, message: "Please enter the email" },
                    {
                      type: "email",
                      message: "Please enter a valid email address",
                    },
                  ]}
                >
                  <Input placeholder="Pet owner email" />
                </Form.Item>
                <Form.Item
                  label="Pet Owner Phone"
                  name="phoneNumber"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the phone number",
                    },
                  ]}
                >
                  <Input placeholder="Pet owner phone" />
                </Form.Item>
              </Panel>

              <Panel header="Pet Info" key="2">
                <Form.Item
                  label="Pet Name"
                  name="petName"
                  rules={[
                    { required: true, message: "Please enter the pet name" },
                  ]}
                >
                  <Input placeholder="Pet name" />
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
                  name="petAge"
                  rules={[
                    { required: true, message: "Please enter the pet age" },
                  ]}
                >
                  <Input placeholder="Pet age" />
                </Form.Item>
                <Form.Item
                  label="Pet Weight"
                  name="petWeight"
                  rules={[
                    { required: true, message: "Please enter the pet weight" },
                  ]}
                >
                  <Input placeholder="Pet weight" />
                </Form.Item>
                <Form.Item
                  label="Pet Gender"
                  name="petGender"
                  rules={[
                    { required: true, message: "Please select the pet gender" },
                  ]}
                >
                  <Select placeholder="Select pet gender">
                    <Select.Option value="male">Male</Select.Option>
                    <Select.Option value="female">Female</Select.Option>
                  </Select>
                </Form.Item>
              </Panel>

              <Panel header="Appointment Info" key="3">
                <Form.Item
                  label="Appointment Purpose"
                  name="purpose"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the appointment purpose",
                    },
                  ]}
                >
                  <Input placeholder="Appointment purpose" />
                </Form.Item>
                <Form.Item
                  label="Appointment Date"
                  name="appointmentDate"
                  rules={[
                    {
                      required: true,
                      message: "Please select an appointment date",
                    },
                  ]}
                >
                  <DatePicker
                    showTime
                    format="YYYY-MM-DD HH:mm"
                    minuteStep={30}
                  />
                </Form.Item>
                <Form.Item label="Additional Notes" name="notes">
                  <Input.TextArea rows={4} placeholder="Additional notes" />
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
