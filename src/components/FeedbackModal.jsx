import React, { useState } from "react";
import { Button, Box, Typography, Modal, TextField } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "400px",
  bgcolor: "background.paper",
  border: "2px solid #999",
  boxShadow: 24,
  padding: "20px",
};

export default function FeedbackModal({ visible, onClose }) {
  const [textFieldValue, setTextFieldValue] = useState("");

  const handleTextFieldChange = (event) => {
    setTextFieldValue(event.target.value);
  };

  const handleSubmit = () => {
    onClose(textFieldValue);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      // Handle submit on Enter key press
      handleSubmit();
    }
  };

  return (
    <Modal
      open={visible}
      onClose={() => {
        onClose("");
      }}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Feedback:
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          <TextField
            id="outlined-multiline-flexible"
            label="Feedback"
            multiline
            fullWidth
            maxRows={10}
            value={textFieldValue}
            onChange={handleTextFieldChange}
            onKeyPress={handleKeyPress}
          />
          <Button
            style={{
              backgroundColor: "black",
              color: "whitesmoke",
              marginTop: "10px",
            }}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </Typography>
      </Box>
    </Modal>
  );
}
