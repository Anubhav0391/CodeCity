import React, { useEffect, useState } from "react";
import Editor from "./Editor";
import { BsGithub } from "react-icons/bs";
import { useToast } from '@chakra-ui/react'
import {
  ChakraProvider,
  Box,
  Flex,
  Heading,
  Button,
  Spinner,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  RadioGroup,
  Stack,
  Radio,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import axios from "axios";

function Home() {
  const [id, setID] = useState("");
  const [token, setToken] = useState("");
  const [branch, setBranch] = useState("");
  const [file, setFile] = useState("");
  const [commit, setCommit] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPush, setLoadingPush] = useState(false);
  const [repos, setRepos] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [value, setValue] = useState("");
  const [selected, setSelected] = useState(false);
  const [output, setOutput] = useState("");
  const [owner, setOwner] = useState("");

  const url="http://localhost:8080"

  const toast=useToast()

  console.log(token);
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    setLoading(true);
    axios
      .get(`${url}/github-callback?code=${code}`)
      .then((res) => {
        setToken(res.data.access_token);
        setLoading(false);
        
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if(token){
      toast({
        position: 'top',
        title: 'Integrated successfully.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    }
    axios.get(`${url}/client_id`).then((res) => setID(res.data));
  }, [token]);

  function handlePush() {
    onOpen();

    axios.defaults.headers.common["Authorization"] = `token ${token}`;

    setLoading(true);

    axios
      .get("https://api.github.com/user")
      .then((res) => setOwner(res.data.login));

    axios
      .get("https://api.github.com/user/repos")
      .then((res) => {
        console.log(res.data);
        setRepos(res.data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching repositories:", error);
      });
  }

  function handleLogin() {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${id}`;
  }

  async function pushCode(e) {
    e.preventDefault();
    setLoadingPush(true);
    axios
      .post(`${url}/push`, {
        accessToken: token,
        branchName: branch,
        fileContent: output,
        fileName: file,
        owner: owner,
        repo: value,
        commitMessage: commit,
      })
      .then((res) => {
        toast({
          position: 'top',
          title: 'File pushed successfully.',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
        setLoadingPush(false)
      })
    .catch((err) => {
      setTimeout(()=>{
        toast({
          position: 'top',
          title: 'Something went wrong while pushing file.',
          description:'Please try after some time.',
          status: 'error',
          duration: 2000,
          isClosable: true,
        })
        setLoadingPush(false);
      },3000)
    });
  }

  function closeFn(){
    onClose()
    setSelected(false)
  }

  return (
    <ChakraProvider>
      <Box p="3" backgroundColor={"#212121"}>
        <Flex align="center" px={2} pt={2}>
          <Box flex="1">
            <Heading color={"whiteAlpha.800"}>CodeCity</Heading>
          </Box>

          <Button
            color={"black"}
            backgroundColor={"whiteAlpha.800"}
            fontSize={"20px"}
            onClick={token ? handlePush : handleLogin}
            w={40}
          >
            {" "}
            {loading ? "" : <BsGithub style={{ marginRight: "10px" }} />}
            {loading ? <Spinner /> : token ? "Push Code" : "Integrate"}
          </Button>

          <Modal
            isCentered
            onClose={closeFn}
            isOpen={isOpen}
            motionPreset="slideInBottom"
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                {selected
                  ? "Fill the details below to push your file."
                  : "Choose any repositery where you want to push the code."}
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Box h={"500px"} overflow={"auto"}>
                  {selected ? (
                    <form>
                      <FormControl>
                        <FormLabel>Branch</FormLabel>
                        <Input
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                          placeholder="eg. main"
                        />
                      </FormControl>

                      <FormControl mt={4}>
                        <FormLabel>File Path</FormLabel>
                        <Input
                          value={file}
                          onChange={(e) => setFile(e.target.value)}
                          placeholder="eg. demo.js"
                        />
                      </FormControl>

                      <FormControl mt={4}>
                        <FormLabel>Commit Message</FormLabel>
                        <Input
                          value={commit}
                          onChange={(e) => setCommit(e.target.value)}
                          placeholder="eg. pushing demo.js in main branch"
                        />
                      </FormControl>
                    </form>
                  ) : (
                    <RadioGroup onChange={setValue} value={value}>
                      <Stack direction="column">
                        {repos.length ? (
                          repos.map((repo) => (
                            <Radio key={repo.id} value={repo.name}>
                              {repo.name}
                            </Radio>
                          ))
                        ) : loading ? (
                          <Spinner m={'250px auto'} thickness='4px'/>
                        ) : (
                          ""
                        )}
                      </Stack>
                    </RadioGroup>
                  )}
                </Box>
              </ModalBody>
              <ModalFooter>
                <Button
                  backgroundColor={"black"}
                  color={"whiteAlpha.800"}
                  w={40}
                  onClick={selected ? pushCode : () => setSelected(true)}
                >
                  {loadingPush?<Spinner/>:selected ? " Push " : "Select"}
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Flex>
        <Editor output={output} setOutput={setOutput} url={url}/>
      </Box>
    </ChakraProvider>
  );
}

export default Home;
