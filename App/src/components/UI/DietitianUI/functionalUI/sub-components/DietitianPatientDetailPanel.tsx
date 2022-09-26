import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Flex,
  Text,
  useMediaQuery,
  Heading,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Image,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Divider,
  useToast,
  useColorModeValue,
  TableCaption,
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import { MdToday } from "react-icons/md";
import { WarningIcon } from '@chakra-ui/icons'
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { IRootState } from "../../../../../redux/store";
import {
  BGDetail,
  BPDetail,
  DietitianPatientPanel,
  UserBookingData,
  WeightDetail,
} from "../../../../../utility/models";
import locateToken from "../../../../../utility/Token";
import { exercise, diet } from "../../../../../utility/models";

const dietMappings = new Map([
  ["breakfast", "早餐"],
  ["lunch", "午餐"],
  ["dinner", "晚餐"],
  ["snack", "小食"],
]);

const { REACT_APP_API_SERVER } = process.env;

export default function DietitianPatientDetailPanel(
  patient: DietitianPatientPanel
) {
  const bg = useColorModeValue("gray.200", "gray.700");
  const toast = useToast();
  const dietitianList = useSelector((state: IRootState) => state.dietitian);
  const [isSmallerThan600] = useMediaQuery("(max-width: 600px)");
  const [isLargerThan1700] = useMediaQuery("(min-width: 1700px)");
  const [booking, setBooking] = useState<Array<UserBookingData>>([]);
  const [medRec, setMedRec] = useState<Array<any>>([]);
  const [weightRec, setWeightRec] = useState<Array<WeightDetail>>([]);
  const [bpRec, setBpRec] = useState<Array<BPDetail>>([]);
  const [bgRec, setBgRec] = useState<Array<BGDetail>>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const today = new Date();

  const [foodDetail, setFoodDetail] = useState(Array<diet>);
  const [exDetail, setExDetail] = useState<Array<exercise>>([]);

  //#######Age Function#######
  const userAge = () => {
    let today = new Date();
    let birthDate = new Date(medRec[0].birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    let m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  //################
  //API Functions
  //################

  //Fetch when patient id changes and patient id is not undefined/null
  useEffect(() => {
    async function fetchPatientsRecords() {
      const patientBooking = axios.get(
        `${REACT_APP_API_SERVER}/booking/user/${patient.id}`,
        {
          headers: {
            Authorization: `Bearer ${locateToken()}`,
          },
        }
      );
      const patientMedRec = axios.get(
        `${REACT_APP_API_SERVER}/medical/user/${patient.id}`,
        {
          headers: {
            Authorization: `Bearer ${locateToken()}`,
          },
        }
      );

      axios
        .all([patientBooking, patientMedRec])
        .then(
          axios.spread((...responses) => {
            let patientBookingResult = responses[0];
            let patientMedRecResult = responses[1];
            setBooking(patientBookingResult.data.data);
            setMedRec(patientMedRecResult.data.result);
          })
        )
        .catch(() => {
          Swal.fire({
            icon: "error",
            title: "發生錯誤，請稍後再試",
          });
        });
    }
    async function fetchUserBodyState() {
      const weightFetch = axios.get(
        `${REACT_APP_API_SERVER}/diet/weight/${patient.id}`,
        {
          headers: {
            Authorization: `Bearer ${locateToken()}`,
          },
        }
      );
      const BPFetch = axios.get(
        `${REACT_APP_API_SERVER}/diet/bp/${patient.id}`,
        {
          headers: {
            Authorization: `Bearer ${locateToken()}`,
          },
        }
      );
      const BGFetch = axios.get(
        `${REACT_APP_API_SERVER}/diet/bg/${patient.id}`,
        {
          headers: {
            Authorization: `Bearer ${locateToken()}`,
          },
        }
      );

      axios
        .all([weightFetch, BPFetch, BGFetch])
        .then(
          axios.spread((...responses) => {
            let weightResult = responses[0];
            let BPResult = responses[1];
            let BGResult = responses[2];
            setWeightRec(weightResult.data.weightRec);
            setBpRec(BPResult.data.bpRec);
            setBgRec(BGResult.data.bgRec);
          })
        )
        .catch(() => {
          Swal.fire({
            icon: "error",
            title: "發生錯誤，請稍後再試",
          });
        });
    }
    if (patient.id) {
      fetchPatientsRecords();
      fetchUserBodyState();
    }
  }, [patient.id]);

  useEffect(() => {
    async function fetchExerciseAndDiet() {
      setFoodDetail([]);
      setExDetail([]);
      const exerciseRec = axios.get(
        `${REACT_APP_API_SERVER}/diet/exercisesRecord/${patient.id
        }/${selectedDate?.toISOString()}`,
        {
          headers: {
            Authorization: `Bearer ${locateToken()}`,
          },
        }
      );

      const foodRec = axios.get(
        `${REACT_APP_API_SERVER}/diet/foodIntakeRecord/${patient.id
        }/${selectedDate?.toISOString()}`,
        {
          headers: {
            Authorization: `Bearer ${locateToken()}`,
          },
        }
      );

      axios
        .all([exerciseRec, foodRec])
        .then(
          axios.spread((...data) => {
            let exerciseResult = data[0].data;
            let foodResult = data[1].data;

            if (exerciseResult.success === true) {
              for (let exercise of exerciseResult.list) {
                let exerciseInfo: exercise = {
                  id: exercise.id,
                  name: exercise.ex_type,
                  duration: parseInt(exercise.duration, 10),
                  ex_calories: parseInt(exercise.ex_calories, 10),
                  burn_calories: Math.round(
                    (parseInt(exercise.duration, 10) *
                      parseInt(exercise.ex_calories, 10)) /
                    60
                  ),
                };
                setExDetail((previous) => [...previous, exerciseInfo]);
              }
            }

            if (foodResult.success === true) {
              for (let food of foodResult.list) {
                let diet = dietMappings.get(food.d_type);
                let foodInfo: diet = {
                  id: food.id,
                  name: food.food_name,
                  food_group: food.food_group,
                  food_type: diet as string,
                  food_amount: parseInt(food.food_amount, 10),
                  food_calories: parseInt(food.food_calories, 10),
                  food_intake:
                    (parseInt(food.food_amount, 10) *
                      parseInt(food.food_calories, 10)) /
                    100,
                  carbohydrates: parseInt(food.carbohydrates, 10),
                  protein: parseInt(food.protein, 10),
                  fat: parseInt(food.fat, 10),
                  sodium: parseInt(food.sodium, 10),
                  sugars: parseInt(food.sugars, 10),
                  fiber: parseInt(food.fiber, 10),
                };
                setFoodDetail((previousList) => [...previousList, foodInfo]);
              }
            }
          })
        )
        .catch((error) => {
          setFoodDetail([]);
          setExDetail([]);
          toast({
            position: "top",
            title: `${error.response.data.message}`,
            duration: 3000,
            isClosable: true,
          });
        });
    }
    if (patient.id && selectedDate) {
      fetchExerciseAndDiet();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient.id, selectedDate]);

  // #############################
  // User Information components (first tab first element)
  function UserDetailAndBooking() {
    return (
      <Flex
        flexDir={"column"}
        w={isSmallerThan600 ? "100%" : "30%"}
        h={isSmallerThan600 ? "100%" : isLargerThan1700 ? "682px" : "580px"}
        fontSize={isSmallerThan600 ? "sm" : "md"}
        borderRadius={"3xl"}
        bg={bg}
        p={5}
        gap={2}
      >
        <Heading
          textAlign={"center"}
          w={"100%"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          flexDir={"column"}
          fontSize={"xl"}
        >
          <Image
            boxSize={"50px"}
            objectFit={"scale-down"}
            src="https://4.bp.blogspot.com/-GkpJdW--_FQ/UYtb30fxqwI/AAAAAAAARsI/BYtuOrQAebw/s400/job_information.png"
          />
          病人個人資料
        </Heading>
        <Divider my={3} />
        <Flex>
          <Text flex={1} fontWeight={"extrabold"}>
            用家ID:
          </Text>
          <Text>{patient.id}</Text>
        </Flex>
        <Flex>
          <Text flex={1} fontWeight={"extrabold"}>
            名:
          </Text>
          <Text>{patient.first_name}</Text>
        </Flex>
        <Flex>
          <Text flex={1} fontWeight={"extrabold"}>
            姓:
          </Text>
          <Text>{patient.last_name}</Text>
        </Flex>
        <Flex>
          <Text flex={1} fontWeight={"extrabold"}>
            起始體重:
          </Text>
          <Text>{patient.weight}kg</Text>
        </Flex>
        <Flex>
          <Text flex={1} fontWeight={"extrabold"}>
            身高:
          </Text>
          <Text>{patient.height}cm</Text>
        </Flex>
        <Flex>
          <Text flex={1} fontWeight={"extrabold"}>
            BMI:
          </Text>
          <Text>
            {(patient.weight / (patient.height / 100) ** 2).toPrecision(4)}
          </Text>
        </Flex>
        <Flex>
          <Text flex={1} fontWeight={"extrabold"}>
            性別:
          </Text>
          <Text>
            {patient.gender === 1 ? "男" : patient.gender === 2 ? "女" : "其他"}
          </Text>
        </Flex>
        <Flex>
          <Text flex={1} fontWeight={"extrabold"}>
            香港身份證:
          </Text>
          <Text>{patient.HKID}</Text>
        </Flex>
        <Flex>
          <Text flex={1} fontWeight={"extrabold"}>
            電話:
          </Text>
          <Text>{patient.phone}</Text>
        </Flex>
        <Flex>
          <Text flex={1} fontWeight={"extrabold"}>
            出生日期:
          </Text>
          <Text>{new Date(patient.birthday).toLocaleDateString()}</Text>
        </Flex>
      </Flex>
    );
  }
  //#######################################
  //All User Medical Record and Booking (first tab second and third element)
  function PatientsBookingAndRecordPanel() {
    return (
      <>
        <Flex
          flexDir={"column"}
          w={isSmallerThan600 ? "100%" : "30%"}
          bg={bg}
          borderRadius={"3xl"}
          alignItems={"center"}
        >
          <Heading
            textAlign={"center"}
            w={"100%"}
            my={5}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            flexDir={"column"}
            fontSize={"xl"}
          >
            <Image
              boxSize={"50px"}
              objectFit={"scale-down"}
              src="https://1.bp.blogspot.com/-FsKd1JB-gCg/X5OcLEtvFTI/AAAAAAABb6M/9PkV67uAPuw-9tp4Rg0AqpmXHJikKcOGQCNcBGAsYHQ/s400/computer_doctor_woman.png"
            />
            病人已預約診期
          </Heading>
          <Flex w={"90%"} maxH={"80%"} overflow={"auto"}>
            <Table size={"sm"}>
              <Thead position="sticky" top={0} bg={"gray.300"} zIndex={100}>
                <Tr>
                  <Th>日期</Th>
                  <Th>時間</Th>
                  <Th>Dietitian</Th>
                </Tr>
              </Thead>
              <Tbody>
                {booking.map((item) => {
                  return (
                    <Tr key={`user_${patient.id}_booking_${item.id}`}>
                      <Td>{new Date(item.date).toLocaleDateString()}</Td>
                      <Td>{item.time.slice(0, -3)}</Td>
                      <Td>{item.first_name + " " + item.last_name}</Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Flex>
          {booking[0] === undefined ? (
            <Heading textAlign={"center"} color={"red.700"} fontSize={"xl"}>
              此用戶暫時未有已預約診期
            </Heading>
          ) : (
            ""
          )}
        </Flex>

        <Flex
          flexDir={"column"}
          w={isSmallerThan600 ? "100%" : "30%"}
          bg={bg}
          borderRadius={"3xl"}
          alignItems={"center"}
        >
          <Heading
            textAlign={"center"}
            w={"100%"}
            my={5}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            flexDir={"column"}
            fontSize={"xl"}
          >
            <Image
              boxSize={"60px"}
              objectFit={"scale-down"}
              src="https://4.bp.blogspot.com/-xbPNbw-wskQ/WD_cc2HtA-I/AAAAAAABAGg/NxmpkevkdtgfxJg2JUqCQAS3FqWpcfDdgCLcB/s400/enkaku_iryou_man.png"
            />
            病人病歷記錄
          </Heading>
          <Box
            w={"90%"}
            maxH={
              isSmallerThan600 ? "auto" : isLargerThan1700 ? "500px" : "390px"
            }
            overflow={"auto"}
          >
            <Accordion allowToggle>
              {medRec.map((rec) => {
                return (
                  <AccordionItem key={`dietitian_reports_${rec.rid}`}>
                    <h2>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          {new Date(rec.date).getFullYear().toString() +
                            "年" +
                            (new Date(rec.date).getMonth() + 1).toString() +
                            "月" +
                            new Date(rec.date).getDate().toString() +
                            "日"}
                          的診症記錄
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>

                      <Flex width={'100%'}>
                        <Box flex={1}>
                          <Text fontWeight={"bold"}>
                            主診營養師：{" "}
                            {dietitianList.filter(
                              (dietitian) => dietitian.id === rec.dietitian_id
                            )[0].first_name +
                              " " +
                              dietitianList.filter(
                                (dietitian) => dietitian.id === rec.dietitian_id
                              )[0].last_name}
                          </Text>
                          <Text fontWeight={"bold"}>
                            日期： {new Date(rec.date).toLocaleDateString()}
                          </Text>
                          <Text fontWeight={"bold"}>姓： {rec.last_name}</Text>
                          <Text fontWeight={"bold"}>名： {rec.first_name}</Text>
                          <Text fontWeight={"bold"}>HKID： {rec.hkid}</Text>
                          <Text fontWeight={"bold"}>年齡： {userAge()}</Text>
                          <Text fontWeight={"bold"}>
                            性別：{" "}
                            {rec.gender === 1
                              ? "男"
                              : rec.gender === 2
                                ? "女"
                                : "其他"}
                          </Text>
                          <Text fontWeight={"bold"}>身高： {rec.height} cm</Text>
                          <Text fontWeight={"bold"}>
                            起初體重： {rec.weight} kg
                          </Text>
                          <Text fontWeight={"bold"}>
                            BMI：{" "}
                            {(rec.weight / (rec.height / 100) ** 2)
                              .toString()
                              .slice(0, 5)}{" "}
                          </Text>
                          <Text fontWeight={"bold"}>
                            血壓： {rec.bp}/{rec.dbp} mmHG
                          </Text>
                          <Text fontWeight={"bold"}>血糖：{rec.bg} mmol/L</Text>
                          <Text fontWeight={"bold"}>慢性疾病：{rec.disease} </Text>

                        </Box>

                        <Box flex={1}>
                          <Text fontWeight={"bold"}>評估：</Text>
                          <Text fontWeight={"bold"}>{rec.content}</Text>
                        </Box>
                      </Flex>

                    </AccordionPanel>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </Box>
        </Flex>
      </>
    );
  }
  //#######################################

  function DietitianUserExerciseAndFoodDetailPanel() {
    // const [intake, setIntake] = useState(0)
    let intake = 0
    foodDetail.map((food) => (intake += food.food_intake))

    return (
      <>
        {/* The popover date picker */}
        <Flex alignSelf={"center"} justifyContent={"center"} w="100%" my={-3}>
          <Popover>
            <PopoverTrigger>
              <Box as="button" fontSize={"xl"} fontWeight={"extrabold"}>
                {selectedDate?.toLocaleDateString()} 📅
              </Box>
            </PopoverTrigger>
            <PopoverContent>
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverHeader fontSize={"3xL"} display={"flex"}>
                <Text>請選擇想查看的日期</Text>
              </PopoverHeader>
              <PopoverBody>
                <Flex justifyContent={"center"} mb={-6}>
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={selectedDate && { after: today }}
                    defaultMonth={new Date()}
                    modifiersClassNames={{
                      selected: "my-selected",
                      today: "my-today",
                    }}
                    required={true}
                    fixedWeeks
                  />
                </Flex>
                <Button
                  onClick={() => setSelectedDate(new Date())}
                  display={"flex"}
                  flexDir={"column"}
                >
                  <MdToday />
                  今日
                </Button>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </Flex>
        {/* The popover date picker end*/}
        {/* The actual panel */}
        <Flex
          w={"100%"}
          h={"99%"}
          flexWrap={"wrap"}
          gap={5}
          justifyContent={"center"}
        >
          <Flex
            w={isSmallerThan600 ? "100%" : "47%"}
            h={isSmallerThan600 ? "100%" : isLargerThan1700 ? "655px" : "560px"}
            minH={"500px"}
            justifyContent={"center"}
            gap={5}
            flexWrap={"wrap"}
          >
            {/* exercise panel dietitian */}
            <Flex
              flexDir={"column"}
              bg={bg}
              w={"100%"}
              borderRadius={"3xl"}
              alignItems={"center"}
              p={3}
            >
              <Heading textAlign={"center"} fontSize={"2xl"}>
                運動
              </Heading>
              <Flex w={"100%"} overflow={"auto"} mt={2}>
                <Table
                  size={"sm"}
                  maxW={"100%"}
                  fontSize={isSmallerThan600 ? "xs" : "md"}
                >
                  <Thead position="sticky" top={0} bg={"gray.300"} zIndex={1} >
                    <Tr>
                      <Th fontSize={'md'} color='black'>時長(mins)</Th>
                      <Th fontSize={'md'} color='black'>運動</Th>
                      <Th fontSize={'md'} color='black'>消耗(kcal)</Th>
                    </Tr>
                  </Thead>

                  <Tbody>
                    {exDetail[0]
                      ? exDetail.map((item) => {
                        return (
                          <Tr>
                            <Td fontSize={'large'}>{item.duration}</Td>
                            <Td>
                              <Text
                                maxH={"50px"}
                                maxW={"150px"}
                                overflow="auto"
                                fontSize={'large'}
                              >
                                {item.name}
                              </Text>
                            </Td>
                            <Td fontSize={'large'} >{item.burn_calories}</Td>
                          </Tr>
                        );
                      })
                      : <></>}
                  </Tbody>
                  {exDetail[0] ? <></> :
                    <TableCaption
                      fontSize={'3xl'}
                      textAlign={'center'}>
                      沒有紀錄
                    </TableCaption>}
                </Table>
              </Flex>
            </Flex>
          </Flex>
          {/* end of exercise panel for dietitian view */}
          <Flex
            w={isSmallerThan600 ? "100%" : "47%"}
            h={isSmallerThan600 ? "100%" : isLargerThan1700 ? "655px" : "560px"}
            minH={"500px"}
            justifyContent={"center"}
            gap={5}
            flexWrap={"wrap"}
          >
            <Flex
              flexDir={"column"}
              bg={bg}
              w={"100%"}
              borderRadius={"3xl"}
              alignItems={"center"}
              p={3}
              position={"relative"}
            >

              <Box w={"90%"} maxH={"80%"} overflow={"auto"} mt={2}>
                <Heading textAlign={"center"} fontSize={"2xl"} mb={'4'}>
                  膳食  {intake > 2400 ? <WarningIcon w={8} h={8} color="red.500" /> : ""}
                </Heading>
                {foodDetail[0] ? "" :
                  <Text
                    fontSize={'3xl'}
                    textAlign={'center'}>
                    沒有紀錄
                  </Text>}
                <Accordion allowToggle>
                  {foodDetail
                    .filter((food) => food.food_type === "早餐")
                    .map((food) => (
                      <AccordionItem key={`food_${food.id}`}>
                        <h2>
                          <AccordionButton>
                            <Box flex="1" textAlign="left">
                              {food.name} {`(${food.food_type})`}
                            </Box>
                            <Box flex="1" textAlign="right" >
                              {food.food_intake}kcal
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                          種類: {food.food_group}
                          <br></br>
                          分量: {food.food_amount}g<br></br>
                          每一百克卡路里： {food.food_calories}kcal<br></br>
                          攝入卡路里：{food.food_intake}kcal<br></br>
                          碳水化合物: {food.carbohydrates}g<br></br>
                          糖分: {food.sugars}g<br></br>
                          脂肪: {food.fat}g<br></br>
                          蛋白質: {food.protein}g<br></br>
                          膳食纖維: {food.fiber}g<br></br>
                          鈉: {food.sodium}ng<br></br>
                        </AccordionPanel>
                      </AccordionItem>
                    ))}

                  {foodDetail
                    .filter((food) => food.food_type === "午餐")
                    .map((food) => (
                      <AccordionItem>
                        <h2>
                          <AccordionButton>
                            <Box flex="1" textAlign="left">
                              {food.name} {`(${food.food_type})`}
                            </Box>
                            <Box flex="1" textAlign="right" >
                              {food.food_intake}kcal
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                          種類: {food.food_group}
                          <br></br>
                          分量: {food.food_amount}g<br></br>
                          每一百克卡路里： {food.food_calories}kcal<br></br>
                          攝入卡路里：{food.food_intake}kcal<br></br>
                          碳水化合物: {food.carbohydrates}g<br></br>
                          糖分: {food.sugars}g<br></br>
                          脂肪: {food.fat}g<br></br>
                          蛋白質: {food.protein}g<br></br>
                          膳食纖維: {food.fiber}g<br></br>
                          鈉: {food.sodium}ng<br></br>
                        </AccordionPanel>
                      </AccordionItem>
                    ))}

                  {foodDetail
                    .filter((food) => food.food_type === "晚餐")
                    .map((food) => (
                      <AccordionItem>
                        <h2>
                          <AccordionButton>
                            <Box flex="1" textAlign="left">
                              {food.name} {`(${food.food_type})`}
                            </Box>
                            <Box flex="1" textAlign="right" >
                              {food.food_intake}kcal
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                          種類: {food.food_group}
                          <br></br>
                          分量: {food.food_amount}g<br></br>
                          每一百克卡路里： {food.food_calories}kcal<br></br>
                          攝入卡路里：{food.food_intake}kcal<br></br>
                          碳水化合物: {food.carbohydrates}g<br></br>
                          糖分: {food.sugars}g<br></br>
                          脂肪: {food.fat}g<br></br>
                          蛋白質: {food.protein}g<br></br>
                          膳食纖維: {food.fiber}g<br></br>
                          鈉: {food.sodium}ng<br></br>
                        </AccordionPanel>
                      </AccordionItem>
                    ))}

                  {foodDetail
                    .filter((food) => food.food_type === "小食")
                    .map((food) => (
                      <AccordionItem>
                        <h2>
                          <AccordionButton>
                            <Box flex="1" textAlign="left">
                              {food.name} {`(${food.food_type})`}
                            </Box>
                            <Box flex="1" textAlign="right" >
                              {food.food_intake}kcal
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                          種類: {food.food_group}
                          <br></br>
                          分量: {food.food_amount}g<br></br>
                          每一百克卡路里： {food.food_calories}kcal<br></br>
                          攝入卡路里：{food.food_intake}kcal<br></br>
                          碳水化合物: {food.carbohydrates}g<br></br>
                          糖分: {food.sugars}g<br></br>
                          脂肪: {food.fat}g<br></br>
                          蛋白質: {food.protein}g<br></br>
                          膳食纖維: {food.fiber}g<br></br>
                          鈉: {food.sodium}ng<br></br>
                        </AccordionPanel>
                      </AccordionItem>
                    ))}
                </Accordion>
                <Flex>
                  {foodDetail[0] ?
                    <Box
                      position={'absolute'}
                      bottom={'4'}
                      right={'5'}
                      flex={"1"}
                      fontSize={"2xl"}
                    >
                      總共膳食卡路里: {`${intake}kcal`}
                    </Box> : ""}
                </Flex>
              </Box>
            </Flex>
          </Flex>
        </Flex>
      </>
    );
  }
  //#######################################
  function UserWeightBPBGData() {
    return (
      <>
        <Flex
          flexDir={"column"}
          w={isSmallerThan600 ? "100%" : "30%"}
          h={isSmallerThan600 ? "100%" : isLargerThan1700 ? "682px" : "580px"}
          fontSize={isSmallerThan600 ? "sm" : "md"}
          borderRadius={"3xl"}
          bg={bg}
          p={5}
          gap={2}
        >
          <Flex
            h={isSmallerThan600 ? "auto" : "100px"}
            justifyContent={"center"}
            alignContent={"center"}
          >
            <Flex
              flexDir={"row"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Image
                boxSize={isSmallerThan600 ? "100px" : "100px"}
                objectFit={"scale-down"}
                src="https://4.bp.blogspot.com/-SXG--O1E2i0/VVGVgRDH8QI/AAAAAAAAtmQ/U8HhB5NUFgc/s800/kenkoushindan03_taijuu.png"
              />
              <Heading textAlign={"center"} my={2}>
                體重記錄
              </Heading>
            </Flex>
          </Flex>
          <Divider />
          <Flex w={"100%"} maxH={"480px"} overflow={"auto"}>
            {/* Weight Table */}
            <Table variant="simple" size={"sm"}>
              <Thead position="sticky" top={0} bg={"gray.100"}>
                <Tr>
                  <Th>日期</Th>
                  <Th textAlign={"center"}>體重(kg)</Th>
                </Tr>
              </Thead>
              <Tbody>
                {weightRec.map((rec) => {
                  return (
                    <Tr key={`weight_rec_${rec.id}`}>
                      <Td fontSize={isSmallerThan600 ? "14" : "16"}>
                        {new Date(rec.date).toLocaleDateString()}
                      </Td>
                      <Td
                        fontSize={isSmallerThan600 ? "14" : "16"}
                        textAlign={"center"}
                      >
                        {rec.weight}
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
            {/* Weight Table end */}
          </Flex>
        </Flex>
        {/* BP */}
        <Flex
          flexDir={"column"}
          w={isSmallerThan600 ? "100%" : "30%"}
          h={isSmallerThan600 ? "100%" : isLargerThan1700 ? "682px" : "580px"}
          fontSize={isSmallerThan600 ? "sm" : "md"}
          borderRadius={"3xl"}
          bg={bg}
          p={5}
          gap={2}
        >
          <Flex
            h={isSmallerThan600 ? "auto" : "100px"}
            justifyContent={"center"}
            alignContent={"center"}
          >
            <Flex
              flexDir={"row"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Image
                boxSize={isSmallerThan600 ? "70px" : "100px"}
                objectFit={"scale-down"}
                src="https://1.bp.blogspot.com/-YIL1WatLnQc/U82wyiz4GnI/AAAAAAAAjDk/i1S5WQtHxWs/s400/body_shinzou_good.png"
              />
              <Heading textAlign={"center"} my={2}>
                血壓記錄
              </Heading>
            </Flex>
          </Flex>
          <Divider />
          {/* BP Table */}
          <Flex
            w={"100%"}
            maxH={"500px"}
            overflow={"auto"}
            overflowX={"hidden"}
          >
            <Table variant="simple" size={"sm"}>
              <Thead position="sticky" top={0} bg={"gray.100"}>
                <Tr>
                  <Th>日期</Th>
                  <Th>時間</Th>
                  <Th textAlign={"center"}>上壓/下壓(mmHg)</Th>
                </Tr>
              </Thead>
              <Tbody>
                {bpRec.map((rec) => {
                  return (
                    <Tr key={`bp_rec_${rec.id}`}>
                      <Td fontSize={isSmallerThan600 ? "14" : "16"}>
                        {new Date(rec.date).toLocaleDateString()}
                      </Td>
                      <Td fontSize={isSmallerThan600 ? "14" : "16"}>
                        {rec.time.slice(0, -3)}
                      </Td>
                      <Td
                        fontSize={isSmallerThan600 ? "14" : "16"}
                        textAlign={"center"}
                      >
                        {rec.sys_bp}/{rec.dia_bp}
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Flex>
          {/* BP Table end */}
        </Flex>
        {/* BG */}
        <Flex
          flexDir={"column"}
          w={isSmallerThan600 ? "100%" : "30%"}
          h={isSmallerThan600 ? "100%" : isLargerThan1700 ? "682px" : "580px"}
          fontSize={isSmallerThan600 ? "sm" : "md"}
          borderRadius={"3xl"}
          bg={bg}
          p={5}
          gap={2}
        >
          <Flex
            h={isSmallerThan600 ? "auto" : "100px"}
            justifyContent={"center"}
            alignContent={"center"}
          >
            <Flex
              flexDir={"row"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Image
                boxSize={isSmallerThan600 ? "70px" : "100px"}
                objectFit={"scale-down"}
                src="https://1.bp.blogspot.com/-ksgJvY53NnY/VVGVGspTMlI/AAAAAAAAtho/B6brGWmDc9Y/s400/insulin_woman.png"
              />
              <Heading textAlign={"center"} my={2}>
                血糖度數記錄
              </Heading>
            </Flex>
          </Flex>
          <Divider />
          {/* BG Table */}
          <Flex
            w={"100%"}
            maxH={"500px"}
            overflow={"auto"}
            overflowX={"hidden"}
          >
            <Table variant="simple" size={"sm"}>
              <Thead position="sticky" top={0} bg={"gray.100"}>
                <Tr>
                  <Th>日期</Th>
                  <Th>時間</Th>
                  <Th fontSize={"12"} textAlign={"center"}>
                    血糖(mmol/L)
                  </Th>
                </Tr>
              </Thead>
              <Tbody fontSize={"2px"}>
                {bgRec.map((rec) => {
                  return (
                    <Tr key={`bg_rec_${rec.id}`}>
                      <Td fontSize={isSmallerThan600 ? "14" : "16"}>
                        {new Date(rec.date).toLocaleDateString()}
                      </Td>
                      <Td fontSize={isSmallerThan600 ? "14" : "16"}>
                        {rec.time.slice(0, -3)}
                      </Td>
                      <Td
                        fontSize={isSmallerThan600 ? "14" : "16"}
                        textAlign={"center"}
                      >
                        {rec.bg_measurement}
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Flex>
          {/* BG Table end */}
        </Flex>
      </>
    );
  }
  //#######################################
  return (
    <>
      <Tabs variant="soft-rounded" colorScheme="green" w={"100%"} h={"100%"}>
        <TabList>
          <Tab>病人記錄</Tab>
          <Tab>飲食詳情</Tab>
          <Tab>用家記錄</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Flex
              w={"100%"}
              h={"100%"}
              justifyContent={"center"}
              gap={5}
              flexWrap={"wrap"}
            >
              <UserDetailAndBooking />
              <PatientsBookingAndRecordPanel />
            </Flex>
          </TabPanel>
          <TabPanel>
            <Flex
              w={"100%"}
              h={"100%"}
              justifyContent={"space-evenly"}
              gap={5}
              flexWrap={"wrap"}
            >
              <DietitianUserExerciseAndFoodDetailPanel />
            </Flex>
          </TabPanel>
          <TabPanel>
            <Flex
              w={"100%"}
              h={"100%"}
              justifyContent={"space-evenly"}
              gap={5}
              flexWrap={"wrap"}
            >
              <UserWeightBPBGData />{" "}
            </Flex>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
}
