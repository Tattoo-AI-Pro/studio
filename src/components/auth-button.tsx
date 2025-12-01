"use client";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { LogIn, LogOut, User as UserIcon, LoaderCircle, ChevronDown } from "lucide-react";

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
      <Button onClick={handleLogin} className="bg-primary hover:bg-primary/90 text-primary-foreground">
        <LogIn className="mr-2 h-4 w-4" /> Login com Google
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-auto px-2 py-1 flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user.photoURL ?? ""}
              alt={user.displayName ?? "User"}
            />
            <AvatarFallback>
              {user.displayName?.charAt(0) ?? <UserIcon />}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="h-4 w-4 text-white/80" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-black/90 border-white/20 text-white" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.displayName}
            </p>
            <p className="text-xs leading-none text-white/70">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/20"/>
        <DropdownMenuItem onClick={handleLogout} className="focus:bg-white/10 focus:text-white cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
