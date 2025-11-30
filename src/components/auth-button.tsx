"use client";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { LogIn, LogOut, User as UserIcon, LoaderCircle } from "lucide-react";

import { useAuth, useUser } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { doc } from "firebase/firestore";
import { useFirestore } from "@/firebase/provider";

export function AuthButton() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Create or update the user's profile in Firestore
      const userRef = doc(firestore, "users", user.uid);
      const userData = {
        id: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      };
      // We use a non-blocking set so we don't have to wait for the DB write
      setDocumentNonBlocking(userRef, userData, { merge: true });

    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (isUserLoading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <LoaderCircle className="animate-spin" />
      </Button>
    );
  }

  if (!user) {
    return (
      <Button onClick={handleLogin}>
        <LogIn className="mr-2 h-4 w-4" /> Login com Google
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={user.photoURL ?? ""}
              alt={user.displayName ?? "User"}
            />
            <AvatarFallback>
              {user.displayName?.charAt(0) ?? <UserIcon />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.displayName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
