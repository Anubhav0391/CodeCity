import React, { useState } from "react";
import MonacoEditor from "react-monaco-editor";
import axios from "axios";
import {
  Box,
  Button,
  Select,
  Textarea,
  HStack,
  Spinner,
} from "@chakra-ui/react";

const Editor = ({ output, setOutput,url }) => {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  
  console.log(Array.isArray(output))
  
  const handleConvert = async () => {
    setOutput("");
    setLoading(true);
    try {
      const response = await axios.post(
        `${url}/convert`,
        {
          inp_code: code,
          out_lang: language,
        }
      );
      setLoading(false);
      setOutput(response.data);
    } catch (error) {
      console.error("Conversion error:", error);
    }
  };

  const handleRun = async () => {
    setOutput("");
    setLoading(true);
    try {
      const response = await axios.post(
        `${url}/run`,
        {
          inp_code: code,
        }
      );
      console.log(response);
      setLoading(false);
      setOutput(response.data);
    } catch (error) {
      console.error("Run error:", error);
    }
  };

  const handleDebug = async () => {
    setOutput("");
    setLoading(true);
    try {
      const response = await axios.post(
        `${url}/debug`,
        {
          inp_code: code,
        }
      );
      setLoading(false);
      setOutput(response.data);
    } catch (error) {
      console.error("Debug error:", error);
    }
  };

  const handleQualityCheck = async () => {
    setOutput("");
    setLoading(true);
    try {
      const response = await axios.post(
        `${url}/quality`,
        {
          inp_code: code,
        }
      );
      setLoading(false);
      setOutput(response.data);
    } catch (error) {
      console.error("Quality check error:", error);
    }
  };

  const editorOptions = {
    selectOnLineNumbers: true,
    fontSize: 14,
    colorDecorators: false,
    scrollBeyondLastLine: false,
    wordWrap: "on",
    formatOnPaste: true,
    automaticLayout: true,
    // Enable syntax highlighting
    language: language.toLowerCase(), // Set the language dynamically
    // Monaco Editor theme customization
    // theme: "hc-black",
  };

  return (
    <>
      <HStack
        spacing={4}
        align="flex-start"
        width="80%"
        justifyContent={"space-between"}
        margin={"20px auto"}
      >
        <Select
          onChange={(e) => setLanguage(e.target.value)}
          width="70%"
          color={"white"}
          fontSize={"20px"}
        >
          <option
            value="javascript"
            style={{ color: "black", backgroundColor: "gainsboro" }}
          >
            JavaScript
          </option>
          <option
            value="python"
            style={{ color: "black", backgroundColor: "gainsboro" }}
          >
            Python
          </option>
          <option
            value="typescript"
            style={{ color: "black", backgroundColor: "gainsboro" }}
          >
            TypeScript
          </option>
          <option
            value="java"
            style={{ color: "black", backgroundColor: "gainsboro" }}
          >
            Java
          </option>
        </Select>
        <Button
          onClick={handleConvert}
          fontSize={"20px"}
          w={"30%"}
          backgroundColor={"whiteAlpha.800"}
        >
          Convert
        </Button>
      </HStack>
      <HStack spacing={4} align="flex-start" width="100%">
        <Box width="50vw" height="500px" backgroundColor={"black"} pt={"20px"}>
          <MonacoEditor
            theme={"hc-black"}
            language={language.toLowerCase()}
            value={code}
            onChange={setCode}
            options={editorOptions}
            height="500px"
            width="50vw"
          />
        </Box>
        <Box
          width="50%"
          // width="100%"
          border={"black"}
          height="520px"
          backgroundColor={"black"}
          color={"white"}
          fontSize={"20px"}
          //   p={5}
        >
          {loading ? (
            <Spinner
              m={"250px auto"}
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
              display={"block"}
            />
          ) : (
            <Textarea
              width="100%"
              resize={"none"}
              // width="100%"
              readOnly={true}
              border={"black"}
              height="520px"
              backgroundColor={"black"}
              color={"white"}
              fontSize={"20px"}
              p={5}
              value={output ? output : ""}
            />
          )}
        </Box>
      </HStack>
      <HStack justifyContent={"right"} my={"20px"}>
        <Button
          onClick={handleDebug}
          fontSize={"20px"}
          //   w={"30%"}
          backgroundColor={"whiteAlpha.800"}
        >
          Debug
        </Button>
        <Button
          onClick={handleQualityCheck}
          fontSize={"20px"}
          //   w={"30%"}
          backgroundColor={"whiteAlpha.800"}
        >
          Check Quality
        </Button>
        <Button
          onClick={handleRun}
          fontSize={"20px"}
          //   w={"30%"}
          backgroundColor={"whiteAlpha.800"}
        >
          Run
        </Button>
      </HStack>
    </>
  );
};

export default Editor;
