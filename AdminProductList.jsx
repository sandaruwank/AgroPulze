import React, { useState, useEffect } from 'react';
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";
import { Modal, Button, Typography, Form, Input, Select } from 'antd';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from '../assets/logo.png';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

// Define theme colors
const theme = {
  primary: '#388e3c',
  white: '#ffffff',
  lightGreen: '#e8f5e9',
  textGreen: '#388e3c',
  darkGreen: '#2e7d32',
  hoverGreen: '#1b5e20',
  borderGreen: '#81c784',
  backgroundGreen: '#f1f8e9'
};

export default function AdminProductList() {
  const [item, setItem] = useState([]);
  const [visible, setVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [image, setImage] = useState(null);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    function getItem() {
      axios
        .get("http://localhost:5000/api/products/getall")
        .then((res) => {
          setItem(res.data);
        })
        .catch((err) => {
          alert(err.message);
        });
    }
    getItem();
  }, []);

  const onFinish = (values) => {
    axios
      .put(`http://localhost:5000/api/products/update/${editItem._id}`, values)
      .then((response) => {
        setVisible(false);
        alert("Successfully updated");
        window.location.reload();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const sendData = async (values) => {
    try {
      const formData = new FormData();
      if (image) {
        formData.append("image", image);
      }
      for (const key in values) {
        formData.append(key, values[key]);
      }

      await axios.post("http://localhost:5000/api/products/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      form.resetFields();
      setAddVisible(false);
      alert("Form Submitted");
      window.location.reload();
    } catch (err) {
      alert(err);
    }
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/delete/${id}`);
      window.location.reload();
    } catch (error) {
      alert('Error deleting data', error);
    }
  };

  const generateProductReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Add logo
    const logoWidth = 50;
    const logoHeight = 50;
    const logoX = (pageWidth - logoWidth) / 2;
    doc.addImage(logo, 'PNG', logoX, 20, logoWidth, logoHeight);
    
    // Add company name
    doc.setTextColor(34, 139, 34); 
    doc.setFontSize(24);
    doc.text("AGRIPULSE FARM STORE", pageWidth/2, 85, { align: "center" });
    
    // Add company details
    doc.setTextColor(34, 139, 34);
    doc.setFontSize(12);
    doc.text("123 Farm Street, Colombo, Sri Lanka", pageWidth/2, 95, { align: "center" });
    doc.text("Phone: +94 123 456 789 | Email: info@agripulse.com", pageWidth/2, 102, { align: "center" });
    doc.text("www.agripulse.com", pageWidth/2, 109, { align: "center" });
    
    // Add line separator
    doc.setDrawColor(0, 51, 153);
    doc.setLineWidth(0.5);
    doc.line(20, 115, pageWidth - 20, 115);
    
    // Add report title
    doc.setFontSize(18);
    doc.setTextColor(34, 139, 34);
    doc.text("Product Inventory Report", pageWidth/2, 130, { align: "center" });
    
    // Add date
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const currentDate = new Date().toLocaleDateString();
    doc.text(`Date: ${currentDate}`, 20, 145);

    // Create the table
    const tableColumn = ["Product Name", "Description", "Price (LKR)", "Stock", "Category"];
    const tableRows = item.map(product => [
      product.name,
      product.description,
      product.price,
      product.stock,
      product.category
    ]);

    autoTable(doc, {
      startY: 160,
      head: [tableColumn],
      body: tableRows,
      headStyles: {
        fillColor: [34, 139, 34], // Forest Green
        textColor: [255, 255, 255],
        fontSize: 12,
        halign: 'center',
        fontStyle: 'bold'
      },
      bodyStyles: {
        textColor: [0, 0, 0],
        fontSize: 11,
        halign: 'left',
        cellPadding: 5
      },
      alternateRowStyles: {
        fillColor: [240, 255, 240] // Light mint green
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 60 },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 25, halign: 'center' }
      },
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
      tableWidth: 'auto',
      didDrawPage: function(data) {
        // Add table title on each page
        doc.setFontSize(14);
        doc.setTextColor(34, 139, 34);
        doc.text('Product Inventory Details', data.settings.margin.left, data.settings.margin.top - 10);
      }
    });

    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    doc.save("AgroPulse_Product_Report.pdf");
  };

  return (
    <div style={{
      padding: '40px 20px',
      background: theme.backgroundGreen,
      minHeight: '100vh'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <Title level={2} style={{
          color: theme.primary,
          margin: 0,
          fontWeight: '700'
        }}>
          Manage Shop Inventory
        </Title>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button
            onClick={generateProductReport}
            style={{
              padding: '10px 20px',
              backgroundColor: theme.primary,
              color: theme.white,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(56, 142, 60, 0.2)'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.hoverGreen}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = theme.primary}
          >
            <FontAwesomeIcon icon={faFileAlt} style={{ marginRight: '8px' }} />
            Generate Report
          </button>
          <button
            onClick={() => setAddVisible(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: theme.primary,
              color: theme.white,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(56, 142, 60, 0.2)'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.hoverGreen}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = theme.primary}
          >
            <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px' }} />
            Add Product
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        padding: '0 20px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {item.map((item) => (
          <div key={item._id} style={{
            background: theme.white,
            borderRadius: '10px',
            padding: '15px',
            boxShadow: '0 4px 12px rgba(56, 142, 60, 0.15)',
            transition: 'all 0.3s ease',
            height: '350px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: `2px solid ${theme.primary}`
          }}>
            <div style={{ width: '100%', textAlign: 'center' }}>
              <h3 style={{
                color: theme.primary,
                margin: '0 0 10px 0',
                fontSize: '30px',
                fontWeight: 'bold',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginBottom: '20px'
              }}>
                {item.name}
              </h3>
              <img
                src={`/images/${item.image}`}
                alt={item.name}
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: `1px solid ${theme.borderGreen}`,
                  display: 'block',
                  margin: '0 auto 10px'
                }}
              />
              <div style={{
                color: theme.textGreen,
                fontSize: '0.9em',
                lineHeight: '1.5',
                textAlign: 'left',
                padding: '0 10px'
              }}>
                <p style={{ margin: '2px 0' }}>
                  <strong style={{ color: theme.primary }}>Price:</strong> Rs.{item.price}
                </p>
                <p style={{ margin: '2px 0' }}>
                  <strong style={{ color: theme.primary }}>Weight:</strong> {item.weight.value} {item.weight.unit}
                </p>
                <p style={{ margin: '2px 0' }}>
                  <strong style={{ color: theme.primary }}>Category:</strong> {item.category}
                </p>
                <p style={{
                  margin: '2px 0',
                  maxHeight: '30px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  <strong style={{ color: theme.primary }}>Description:</strong> {item.description}
                </p>
              </div>
            </div>
            <div style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'center',
              width: '100%',
              paddingTop: '10px'
            }}>
              <button
                onClick={() => {
                  setEditItem(item);
                  setVisible(true);
                }}
                style={{
                  padding: '6px 15px',
                  backgroundColor: theme.primary,
                  color: theme.white,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9em',
                  transition: 'all 0.3s ease',
                  flex: 1,
                  boxShadow: '0 2px 4px rgba(56, 142, 60, 0.2)'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.hoverGreen}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = theme.primary}
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this item?')) {
                    deleteItem(item._id);
                  }
                }}
                style={{
                  padding: '6px 15px',
                  backgroundColor: theme.primary,
                  color: theme.white,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9em',
                  transition: 'all 0.3s ease',
                  flex: 1,
                  boxShadow: '0 2px 4px rgba(56, 142, 60, 0.2)'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.hoverGreen}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = theme.primary}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <Modal
        title={<Title level={3} style={{ textAlign: 'center', margin: 0, color: theme.primary }}>Update Product</Title>}
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={600}
        style={{ borderRadius: '12px' }}
      >
        <Form
          form={form}
          initialValues={editItem}
          onFinish={onFinish}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          style={{ marginTop: '20px' }}
        >
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input style={{ borderRadius: '6px', borderColor: theme.borderGreen }} />
          </Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true }]}>
            <Input style={{ borderRadius: '6px', borderColor: theme.borderGreen }} type="number" />
          </Form.Item>
          <Form.Item name="weight" label="Weight" rules={[{ required: true }]}>
            <Input style={{ borderRadius: '6px', borderColor: theme.borderGreen }} />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select style={{ borderRadius: '6px', borderColor: theme.borderGreen }}>
              <Option value="white rice">White Rice</Option>
              <Option value="red rice">Red Rice</Option>
              <Option value="imported">Imported</Option>
              <Option value="traditional">Traditional</Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <TextArea rows={4} style={{ borderRadius: '6px', borderColor: theme.borderGreen }} />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                width: '100%',
                backgroundColor: theme.primary,
                borderColor: theme.primary,
                borderRadius: '6px',
                height: '40px',
                boxShadow: '0 2px 4px rgba(56, 142, 60, 0.2)'
              }}
            >
              Update Product
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Modal */}
      <Modal
        title={<Title level={3} style={{ textAlign: 'center', margin: 0, color: theme.primary }}>Add New Product</Title>}
        open={addVisible}
        onCancel={() => setAddVisible(false)}
        footer={null}
        width={600}
        style={{ borderRadius: '12px' }}
      >
        <Form
          form={form}
          onFinish={sendData}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          style={{ marginTop: '20px' }}
        >
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input style={{ borderRadius: '6px', borderColor: theme.borderGreen }} />
          </Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true }]}>
            <Input style={{ borderRadius: '6px', borderColor: theme.borderGreen }} type="number" />
          </Form.Item>
          <Form.Item name="weight" label="Weight" rules={[{ required: true }]}>
            <Input style={{ borderRadius: '6px', borderColor: theme.borderGreen }} />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select style={{ borderRadius: '6px', borderColor: theme.borderGreen }}>
              <Option value="white rice">White Rice</Option>
              <Option value="red rice">Red Rice</Option>
              <Option value="imported">Imported</Option>
              <Option value="traditional">Traditional</Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <TextArea rows={4} style={{ borderRadius: '6px', borderColor: theme.borderGreen }} />
          </Form.Item>
          <Form.Item label="Image" required>
            <input
              type="file"
              name="image"
              onChange={(e) => setImage(e.target.files[0])}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: `1px solid ${theme.borderGreen}`
              }}
            />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                width: '100%',
                backgroundColor: theme.primary,
                borderColor: theme.primary,
                borderRadius: '6px',
                height: '40px',
                boxShadow: '0 2px 4px rgba(56, 142, 60, 0.2)'
              }}
            >
              Add Product
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}