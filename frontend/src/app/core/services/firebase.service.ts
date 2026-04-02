import { InjectionToken } from "@angular/core";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { environment } from "../../../environments/environment";

const firebaseApp = initializeApp(environment.firebase);
const firebaseAuth = getAuth(firebaseApp);

export const FirebaseAuthToken = new InjectionToken("FirebaseAuth", {
  providedIn: "root",
  factory: () => firebaseAuth,
});
