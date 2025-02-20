import React, { useState, useEffect } from "react";
import {
  View,
  Modal,
  Button,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  ActivityIndicator, // Close modal area luar
} from "react-native";
import * as ImagePicker from "expo-image-picker"; // Pastikan Anda sudah menginstal expo-image-picker
import { ReusableBtn } from "..";
import { COLORS, SIZES, TEXT } from "../../constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";

const ReusablePhotoImage = ({
  onImagePathChange,
  title,
  color,
  initialImage,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(
    initialImage ? [initialImage] : []
  );
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  const apiUrl2 = process.env.URL3;
  const port33 = process.env.PORT_IMAGE_UPLOAD;

  let judul = title ? title : "Select Image";

  useEffect(() => {
    if (initialImage) {
      setSelectedImage([initialImage]);
      setImage(initialImage);
      onImagePathChange(initialImage);
    }
  }, [initialImage]);

  const pickImageAndUpload = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your photos!");
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!pickerResult.canceled) {
      const newImageUri = pickerResult.assets[0].uri;
      await uploadImage(newImageUri); // Pass the URI directly
    }
  };

  const takePhoto = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (!cameraPermission.granted) {
      alert("Permission to access camera was denied");
      return;
    }

    let cameraResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!cameraResult.canceled) {
      const newImageUri = cameraResult.assets[0].uri;
      await uploadImage(newImageUri); // Pass the URI directly
    }
  };

  const uploadImage = async (uri) => {
    setLoading(true);
    const formData = new FormData();

    formData.append("images", {
      uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
      type: "image/jpeg", // Adjust based on your image type
      name: uri.split("/").pop(), // This ensures the file has a name
    });

    if (image) {
      try {
        const parts = image.split("/");
        const fileName = parts.pop();
        let response = await fetch(`${apiUrl2}:${port33}/uploads/${fileName}`, {
          method: "DELETE",
          body: formData,
        });
        let responseJson = await response.status;
        if (responseJson === 200) {
          console.log("image berhasil di hapus ", responseJson);
        } else {
          console.log("image gagal di hapus ", responseJson);
        }
      } catch (error) {
        console.error("Data baru");
      }
    }

    try {
      let response = await fetch(`${apiUrl2}:${port33}/upload`, {
        method: "POST",
        body: formData,
      });
      let responseJson = await response.json();
      let imageUrl = responseJson.uploadedFiles[0];

      setImage(imageUrl);
      onImagePathChange(imageUrl);
      setLoading(false);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Upload failed, please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(" data baru uploade image ", image);
  }, [image]);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.green} />
      ) : (
        <>
          {selectedImage == "" ? (
            <ReusableBtn
              btnText={judul}
              onPress={() => setModalVisible(true)}
              width={SIZES.width - 250}
              backgroundColor={COLORS.green}
              borderColor={COLORS.green}
              borderWidth={0}
              textColor={COLORS.white}
            />
          ) : (
            <View style={styles.btnView}>
              <ReusableBtn
                btnText={"GANTI FOTO"}
                onPress={() => setModalVisible(true)}
                width={SIZES.width - 250}
                backgroundColor={COLORS.red}
                borderColor={COLORS.green}
                borderWidth={0}
                textColor={COLORS.white}
              />
            </View>
          )}

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(!modalVisible);
            }}
          >
            <TouchableWithoutFeedback
              onPress={() => setModalVisible(!modalVisible)}
            >
              <View style={styles.overlayStyle}>
                <View style={styles.centeredModalView}>
                  <View style={styles.modalView}>
                    {/* <ReusableBtn
                      btnText={"PILIH FOTO"}
                      onPress={() => {
                        pickImageAndUpload();
                        setModalVisible(!modalVisible);
                      }}
                      width={'50%'}
                      backgroundColor={COLORS.green}
                      borderColor={COLORS.green}
                      borderWidth={0}
                      textColor={COLORS.white}
                    /> */}
                    <Text>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Text>
                    <ReusableBtn
                      btnText={"AMBIL FOTO"}
                      onPress={() => {
                        takePhoto();
                        setModalVisible(!modalVisible);
                      }}
                      width={"50%"}
                      backgroundColor={COLORS.green}
                      borderColor={COLORS.green}
                      borderWidth={0}
                      textColor={COLORS.white}
                    />
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          <View style={styles.imageContainer}>
            {image ? (
              <Image source={{ uri: image }} style={styles.image} />
            ) : null}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centeredModalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: "row", // Arrange buttons in a row
    justifyContent: "space-between", // Space the buttons out evenly
  },
  btnView: {
    margin: 1,
    backgroundColor: "white",
    borderRadius: 1,
    padding: 1,
    alignItems: "center",
    flexDirection: "row", // Arrange buttons in a row
    justifyContent: "space-around", // Space the buttons out evenly
  },
  button: (color) => ({
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    // backgroundColor: "#2196F3",
    backgroundColor: color,
    // Add margin to separate the buttons if needed
    marginHorizontal: 10,
    marginRight: 10, // Menambahkan margin kanan pada tombol pertama
    marginLeft: 10, // Menambahkan margin kiri pada tombol kedua
  }),
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 20,
  },
  image: {
    width: "95%",
    height: 300,
    margin: 5,
  },
  overlayStyle: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Warna abu-abu dengan transparansi
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ReusablePhotoImage;
