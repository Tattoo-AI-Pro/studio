import { Book, PlusCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { placeholderBook } from "@/lib/placeholder-data";

export default function DashboardPage() {
  const books = [placeholderBook]; // In a real app, this would be fetched

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-card/80 backdrop-blur-sm px-4 md:px-6 z-10">
        <div className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <Book className="h-6 w-6 text-primary" />
          <span className="font-headline text-2xl tracking-wide">
            Tattoo AI-Book Factory
          </span>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="font-headline text-3xl font-semibold">My AI-Books</h1>
          <Button asChild size="sm" className="ml-auto gap-1">
            <Link href="/books/1">
              Create AI-Book
              <PlusCircle className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {books.map((book) => (
            <Card
              key={book.id}
              className="hover:shadow-accent/20 hover:shadow-lg transition-shadow duration-300 rounded-lg overflow-hidden group"
            >
              <Link href={`/books/${book.id}`} className="block">
                <CardHeader className="p-0">
                  <div className="relative aspect-[3/4] w-full overflow-hidden">
                    <Image
                      src={book.coverArtUrl}
                      alt={`Cover for ${book.name}`}
                      width={400}
                      height={533}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint="book cover"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="font-headline text-xl leading-tight">
                    {book.name}
                  </CardTitle>
                  <CardDescription className="font-body text-base mt-2">
                    {book.shortDescription}
                  </CardDescription>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
