"use client";

import {
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
  List,
  Row,
  Col,
} from "antd";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Header, Content, Footer } = Layout;
const { Panel } = Collapse;

export default function PetPatient() {
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
    petBreed: "",
    petGender: "",
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
      .get("http://localhost:8080/pet")
      .then((response) => {
        setAppointments(response.data);
      })
      .catch((error) => {
        message.error("Failed to load pets.");
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
        appointment.name.toLowerCase().includes(filter.petName.toLowerCase());
      const matchesPetType =
        !filter.petType ||
        appointment.type.toLowerCase() === filter.petType.toLowerCase();
      const matchesPetBreed =
        !filter.petBreed ||
        appointment.breed.toLowerCase().includes(filter.petBreed.toLowerCase());
      const matchesPetGender =
        !filter.petGender ||
        appointment.gender.toLowerCase() === filter.petGender.toLowerCase();

      return (
        matchesPetOwner &&
        matchesPetName &&
        matchesPetType &&
        matchesPetBreed &&
        matchesPetGender
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
          `http://localhost:8080/pet/update?documentId=${currentAppointment?.documentId}`,
          values
        )
      : axios.post("http://localhost:8080/pet/create", values);

    apiRequest
      .then(() => {
        axios
          .get("http://localhost:8080/pet")
          .then((response) => {
            setAppointments(response.data);
            message.success(
              isEditing ? "Pet updated successfully" : "Pet added successfully"
            );
          })
          .catch(() => message.error("Failed to load pet"));
      })
      .catch(() =>
        message.error(isEditing ? "Failed to update pet" : "Failed to add pet")
      );

    setIsModalVisible(false);
  };

  const handleDelete = (documentId: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this pet record?",
      content: "Once deleted, this action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      width: 800,
      cancelText: "Cancel",
      onOk: () => {
        axios
          .delete(`http://localhost:8080/pet/delete?documentId=${documentId}`)
          .then(() => {
            axios
              .get("http://localhost:8080/pet")
              .then((response) => {
                setAppointments(response.data);
                message.success("Pet deleted successfully");
              })
              .catch(() => message.error("Failed to load pet"));
          })
          .catch(() => message.error("Failed to delete pet"));
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
            defaultSelectedKeys={["pet"]}
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
            <Col span={4}>
              <Input
                placeholder="Pet Name"
                value={filter.petName}
                onChange={(e) => handleFilterChange("petName", e.target.value)}
              />
            </Col>

            <Col span={4}>
              <Input
                placeholder="Pet Owner"
                value={filter.petOwner}
                onChange={(e) => handleFilterChange("petOwner", e.target.value)}
              />
            </Col>

            <Col span={4}>
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

            <Col span={4}>
              <Input
                placeholder="Pet Breed"
                value={filter.petBreed}
                onChange={(e) => handleFilterChange("petBreed", e.target.value)}
              />
            </Col>

            <Col span={4}>
              <Select
                placeholder="Pet Gender"
                value={filter.petGender}
                onChange={(value) => handleFilterChange("petGender", value)}
                style={{ width: "100%" }}
              >
                <Select.Option value="">All</Select.Option>
                <Select.Option value="Male">Male</Select.Option>
                <Select.Option value="Female">Female</Select.Option>
              </Select>
            </Col>

            <Col span={4} style={{ textAlign: "right" }}>
              <Button type="primary" onClick={handleAdd}>
                Add Pet
              </Button>
            </Col>
          </Row>
        </div>

        <List
          dataSource={filteredAppointments}
          renderItem={(appointment) => (
            <List.Item
              actions={[
                <Button type="link" onClick={() => handleEdit(appointment)}>
                  Edit
                </Button>,
                <Button
                  danger
                  onClick={() => handleDelete(appointment.documentId)}
                >
                  Delete
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={<Title level={4}>{appointment.name}</Title>}
                description={
                  <div>
                    <p>
                      <Text strong>Owner:</Text> {appointment.ownerFullname}
                    </p>
                    <p>
                      <Text strong>Type:</Text> {appointment.type}
                    </p>
                    <p>
                      <Text strong>Breed:</Text> {appointment.breed}
                    </p>
                    <p>
                      <Text strong>Age:</Text> {appointment.age} years
                    </p>
                    <p>
                      <Text strong>Gender:</Text> {appointment.gender}
                    </p>
                    <p>
                      <Text strong>Weight:</Text> {appointment.weight} kg
                    </p>
                    {appointment.notes && (
                      <p>
                        <Text strong>Notes:</Text> {appointment.notes}
                      </p>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />

        <Modal
          title={isEditing ? "Edit Pet" : "Add Pet"}
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
                  label="Pet Name"
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the pet name",
                    },
                  ]}
                >
                  <Input placeholder="Pet Owner Fullname" />
                </Form.Item>
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
                  label="Pet Type"
                  name="type"
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
                  label="Pet Breed"
                  name="breed"
                  rules={[
                    { required: true, message: "Please enter the pet's breed" },
                  ]}
                >
                  <Input placeholder="Pet Breed" />
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
                <Form.Item
                  label="Pet Gender"
                  name="gender"
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
                  label="Pet Weight"
                  name="weight"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the pet's weight",
                    },
                  ]}
                >
                  <Input placeholder="Pet Weight" />
                </Form.Item>
                <Form.Item label="Additional Notes" name="notes">
                  <Input.TextArea rows={4} placeholder="Additional notes" />
                </Form.Item>
              </Panel>
            </Collapse>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
}
