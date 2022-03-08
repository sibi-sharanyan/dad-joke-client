import { useEffect, useState } from "react";
import {
  ChakraProvider,
  Box,
  Text,
  Link,
  VStack,
  Code,
  Grid,
  theme,
  HStack,
} from "@chakra-ui/react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { socket } from "./util/socketInst";
import { IClient, IJoke } from "./types";
export const App = () => {
  const [clients, setClients] = useState<IClient[]>([]);
  const [jokes, setJokes] = useState<IJoke[]>([]);
  const [streamListners, setStreamListners] = useState<{
    [key: string]: IClient[];
  }>({});

  useEffect(() => {
    socket.on("all-clients", (data: IClient[]) => {
      setClients(data);
    });

    socket.on("joke", (data: IJoke) => {
      setJokes((prevJokes) => [data, ...prevJokes]);
    });

    socket.on("update-sub-streams", (data: { [key: string]: IClient[] }) => {
      console.log("update-sub-streams", data);
      setStreamListners(data);
    });
  }, []);

  return (
    <ChakraProvider theme={theme}>
      <Box textAlign="center" fontSize="xl" h="100vh" w="100vw">
        <DragDropContext
          onDragEnd={(result, provided) => {
            console.log("result", result, "provided", provided);

            if (
              result.destination &&
              result.destination.droppableId === "unsub"
            ) {
              socket.emit("remove-client-from-stream", {
                jokeStreamId: result.source.droppableId,
                clientId: result.draggableId.split("***")[1],
              });
            }

            if (
              result.destination &&
              result.destination.droppableId !== "client-list" &&
              result.source.droppableId !== result.destination?.droppableId
            ) {
              socket.emit("add-client-to-joke-stream", {
                jokeStreamId: result.destination.droppableId,
                clientId: result.draggableId.split("***")[1],
              });

              if (result.draggableId.includes("stream")) {
                socket.emit("remove-client-from-stream", {
                  jokeStreamId: result.source.droppableId,
                  clientId: result.draggableId.split("***")[1],
                });
              }
            }
          }}
        >
          <VStack h="100%">
            <HStack w="100%" h="50%" justifyContent="space-around">
              <VStack h="90%" w="18%">
                <Text>All Clients</Text>

                <Droppable droppableId="client-list" type="clients">
                  {(provided, snapshot) => (
                    <VStack
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      bg={"gray.800"}
                      w={"100%"}
                      px={10}
                      h={"80%"}
                      maxH={"80%"}
                      overflowY="auto"
                    >
                      {clients.map((item, index) => (
                        <Draggable
                          draggableId={`client***${item.id}`}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <VStack
                                my={5}
                                className=""
                                bg="gray.200"
                                w={"10rem"}
                                shadow="base"
                              >
                                <Text>{item.name}</Text>
                              </VStack>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </VStack>
                  )}
                </Droppable>
              </VStack>

              <VStack h="90%" w="70%" alignItems={"flex-start"}>
                <Text>Received Jokes</Text>

                <VStack
                  w="100%"
                  h={"80%"}
                  maxH={"80%"}
                  overflowY="auto"
                  border={"1px solid black"}
                  alignItems="flex-start"
                  spacing={5}
                  px={10}
                >
                  {jokes.map((joke, ind) => {
                    return (
                      <VStack
                        py={5}
                        alignItems={"flex-start"}
                        bg="gray.200"
                        px={10}
                        shadow="lg"
                        w="100%"
                      >
                        <Text fontWeight={"bold"} fontSize="md">
                          {joke.fromClientId}:
                        </Text>
                        <Text textAlign={"start"}> {joke.joke} </Text>
                      </VStack>
                    );
                  })}
                </VStack>
              </VStack>
            </HStack>

            <VStack w="100%" h="50%" alignItems={"flex-start"}>
              <Text pl={10}>All Streams</Text>

              <HStack h="100%" spacing={10} pl={10} overflowX={"auto"}>
                <Droppable droppableId="unsub" type="clients">
                  {(provided, snapshot) => (
                    <VStack
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      bg={"red.700"}
                      w="10rem"
                      px={2}
                      py={2}
                      justifyContent={"center"}
                    >
                      <Text color="white">
                        Drop here to Unsubscribe from Stream
                      </Text>
                    </VStack>
                  )}
                </Droppable>

                {clients.map((client) => {
                  return (
                    <VStack alignItems={"flex-start"} h="100%" w="15rem">
                      <Text>{client.name}'s stream</Text>
                      <Droppable droppableId={client.id} type="clients">
                        {(provided, snapshot) => (
                          <VStack
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            bg={"gray.800"}
                            px={10}
                            w="100%"
                            h="85%"
                            overflowY="auto"
                          >
                            {streamListners[client.id]?.map((item, index) => (
                              <Draggable
                                draggableId={`stream-${client.id}***${item.id}`}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    <VStack
                                      my={5}
                                      className=""
                                      bg="gray.200"
                                      px={10}
                                      shadow="base"
                                    >
                                      <Text>{item.name}</Text>
                                    </VStack>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          </VStack>
                        )}
                      </Droppable>
                    </VStack>
                  );
                })}
              </HStack>
            </VStack>
          </VStack>
        </DragDropContext>
      </Box>
    </ChakraProvider>
  );
};
