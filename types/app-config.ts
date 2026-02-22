export interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
}

export interface CloudinaryConfig {
    cloudName: string;
    uploadPreset: string;
    folder: string;
}

export interface AppConfig {
    id: string;
    name: string;
    firebase: FirebaseConfig;
    cloudinary: CloudinaryConfig;
}
