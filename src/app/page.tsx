"use client";

import { Card, Col, Row, Typography, Layout, Menu, Image } from "antd";
import { useRouter } from "next/navigation";

const { Title, Paragraph } = Typography;
const { Header, Content, Footer } = Layout;

export default function Home() {
  const router = useRouter();

  const menuItems = [
    { label: "Home", key: "home" },
    { label: "Appointment", key: "appointment" },
    { label: "Client", key: "client" },
    { label: "Pet Patient", key: "pet" },
    { label: "Lab Diagnostic", key: "lab" },
    { label: "Medical Inventory", key: "inventory" },
    { label: "Staff", key: "staff" },
    { label: "Ward", key: "ward" },
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
      case "staff":
        router.push("/staff");
        break;
      case "ward":
        router.push("/ward");
        break;
      default:
        router.push("/");
        break;
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ background: "#fff", padding: "0 50px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            Veterinary Clinic Management
          </Title>
          <Menu
            mode="horizontal"
            defaultSelectedKeys={["home"]}
            onClick={handleMenuClick}
            style={{ lineHeight: "64px" }}
            items={menuItems}
          />
        </div>
      </Header>

      <Content style={{ padding: "50px 50px" }}>
        <Row
          gutter={[16, 0]}
          justify="space-between"
          align="middle"
          style={{ padding: "50px 20px" }}
        >
          <Col span={12} style={{ paddingRight: "20px" }}>
            <Title level={2}>Welcome to our Veterinary Clinic</Title>
            <Paragraph style={{ textAlign: "justify" }}>
              We offer professional care for your pets, including check-ups,
              vaccinations, surgeries, and more. You can easily manage
              appointments, track your pet’s records, and keep up with their
              treatments. Our goal is to make sure your pets are happy and
              healthy by providing the best care in a safe and friendly
              environment.
            </Paragraph>
          </Col>
          <Col span={12}>
            <Image
              src="/image.jpg"
              alt="Veterinary Clinic"
              preview={false}
              style={{ marginBottom: 20 }}
            />
          </Col>
        </Row>
        <Row gutter={[16, 0]} justify="space-between" align="middle">
          <Col span={8}>
            <Card title="Our Services" bordered={false}>
              <Paragraph style={{ textAlign: "justify" }}>
                We offer a variety of services for your pets, including
                check-ups, vaccinations, dental care, surgeries, and emergency
                treatments. Each service is designed to ensure that your pets
                stay healthy and happy, with personalized care tailored to their
                needs. Our clinic strives to provide the highest quality
                veterinary services in a caring and professional environment.
              </Paragraph>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="Expert Care" bordered={false}>
              <Paragraph style={{ textAlign: "justify" }}>
                Our team of experienced veterinarians is committed to providing
                the best possible care for your pets. With years of expertise in
                the field, we offer a wide range of treatments from preventive
                health care to specialized medical services. Your pet's
                well-being is our top priority, and we treat every animal with
                compassion and respect.
              </Paragraph>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="Convenience" bordered={false}>
              <Paragraph style={{ textAlign: "justify" }}>
                We make pet care more convenient by allowing you to manage
                appointments, track medical records, and access important health
                information online. Our easy-to-use platform ensures you stay on
                top of your pet’s needs. Book appointments, receive reminders,
                and get updates all from the comfort of your home. It’s pet care
                at your fingertips.
              </Paragraph>
            </Card>
          </Col>
        </Row>
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
