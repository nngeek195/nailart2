import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export async function uploadUserImage(file: File, userId: string, type: "hand" | "result") {
    const storageRef = ref(storage, `users/${userId}/${type}/${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
}