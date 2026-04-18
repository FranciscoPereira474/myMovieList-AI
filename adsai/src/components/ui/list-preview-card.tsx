"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { UserAvatar } from "./user-avatar";
import { Film, Bookmark, Lock } from "lucide-react";

export interface ListPreviewCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** List information */
  list: {
    id: string;
    title: string;
    itemCount: number;
    saveCount: number;
    savedByMe?: boolean;
    isPublic?: boolean;
  };
  /** Author information */
  author: {
    name: string;
    username: string;
    avatarUrl?: string;
  };
  /** Poster URLs (or objects) for collage (need at least 3)
   * each item can be a string (poster url) or an object { poster_url, slug }
   */
  posterUrls: Array<string | { poster_url?: string | null; slug?: string | null }>;
  /** When true, clicking the poster preview navigates to the list page instead of the movie page */
  posterLinkToList?: boolean;
}

function PosterSlot({ src, alt, sizes }: { src?: string; alt: string; sizes: string }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes={sizes}
      />
    );
  }

  return (
    <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center">
      <Film className="w-8 h-8 text-neutral-600" />
    </div>
  );
}

/**
 * * Renders a preview card for a list.
 *  *
 *  * @param {ListPreviewCardProps} props - The properties of the component.
 *  * @returns {JSX.Element} The rendered preview card.
 *  
 * export function ListPreviewCard({
 *   list,
 *   author,
 *   posterUrls,
 *   posterLinkToList = false,
 *   className,
 *   ...props
 * }: ListPreviewCardProps) {
 *   const posters = (posterUrls || []).filter(Boolean);
 *   const posterCount = posters.length;
 *
 *   const getSrc = (p: any) => (typeof p === "string" ? p : p?.poster_url);
 *   const getSlug = (p: any) => (typeof p === "string" ? undefined : p?.slug);
 *   const getPosterLink = (p: any) => (posterLinkToList ? `/list/${list.id}` : (getSlug(p) ? `/movies/${getSlug(p)}` : undefined));
 *   
 *   return (
 *     <article
 *       className={cn("", className)}
 *       {...props}
 *     >
 *       {/* Poster Collage }
 *       <div className="group block">
 *         {posterCount <= 1 && (
 *           <div className="relative h-full w-full bg-neutral-900">
 *             {(() => {
 *               const src = getSrc(posters[0]);
 *               const link = getPosterLink(posters[0]);
 *               const inner = (
 *                 <PosterSlot src={src} alt={list.title} sizes="(max-width: 768px) 100vw, 50vw" />
 *               );
 *               return link ? (
 *                 <Link href={link} className="relative inset-0 block h-full w-full">{inner}</Link>
 *               ) : (
 *                 inner
 *               );
 *             })()}
 *           </div>
 *         )}
 *         
 *         {posterCount === 2 && (
 *           <div className="h-full w-full flex">
 *             <div className="w-1/2 h-full relative bg-neutral-900">
 *               {(() => {
 *                 const src = getSrc(posters[0]);
 *                 const link = getPosterLink(posters[0]);
 *                 const inner = <PosterSlot src={src} alt={list.title} sizes="(max-width: 768px) 50vw, 25vw" />;
 *                 return link ? <Link href={link} className="relative inset-0 block h-full w-full">{inner}</Link> : inner;
 *               })()}
 *             </div>
 *             <div className="w-1/2 h-full relative bg-neutral-900 border-l border-neutral-900">
 *               {(() => {
 *                 const src = getSrc(posters[1]);
 *                 const link = getPosterLink(posters[1]);
 *                 const inner = <PosterSlot src={src} alt="" sizes="(max-width: 768px) 50vw, 25vw" />;
 *                 return link ? <Link href={link} className="relative inset-0 block h-full w-full">{inner}</Link> : inner;
 *               })()}
 *             </div>
 *           </div>
 *         )}
 *         
 *         {posterCount >= 3 && (
 *           <div className="h-full w-full flex">
 *             {/* Main large poster }
 *             <div className="w-2/3 h-full relative bg-neutral-900">
 *               {(() => {
 *                 const src = getSrc(posters[0]);
 *                 const link = getPosterLink(posters[0]);
 *                 const inner = <PosterSlot src={src} alt={list.title} sizes="(max-width: 768px) 66vw, 33vw" />;
 *                 return link ? <Link href={link} className="relative inset-0 block h-full w-full">{inner}</Link> : inner;
 *               })()}
 *               <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors pointer-events-none" />
 *             </div>
 *             
 *             {/* Two smaller posters stacked }
 *             <div className="w-1/3 h-full flex flex-col border-l border-neutral-900">
 *               <div className="h-1/2 relative border-b border-neutral-900 bg-neutral-900">
 *                 {(() => {
 *                   const src = getSrc(posters[1]);
 *                   const link = getPosterLink(posters[1]);
 *                   const inner = <PosterSlot src={src} alt="" sizes="(max-width: 768px) 33vw, 15vw" />;
 *                   return link ? <Link href={link} className="relative inset-0 block h-full w-full">{inner}</Link> : inner;
 *                 })()}
 *               </div>
 *               <div className="h-1/2 relative bg-neutral-900">
 *                 {(() => {
 *                   const src = getSrc(posters[2]);
 *                   const link = getPosterLink(posters[2]);
 *                   const inner = <PosterSlot src={src} alt="" sizes="(max-width: 768px) 33vw, 15vw" />;
 *                   return link ? <Link href={link} className="relative inset-0 block h-full w-full">{inner}</Link> : inner;
 *                 })()}
 *               </div>
 *             </div>
 *           </div>
 *         )}
 *       </div>
 *       
 *       {/* Title }
 *       <div className="mt-3 px-1">
 *         <h3 className="font-bold text-lg text-white transition-colors truncate flex items-center gap-2">
 *           <Link href={`/list/${list.id}`} className="group-hover:text-brand-400 truncate flex items-center gap-2">
 *             <span className="truncate">{list.title}</span>
 *             {!list.isPublic && (
 *               <Lock size={14} className="text-neutral-500" />
 *             )}
 *           </Link>
 *         </h3>
 *       </div>
 *       
 *       {/* Info (author & stats) }
 *       <div className="mt-1 px-1">
 *         <div className="flex items-center justify-between mt-1">
 *           {/* Author: separate avatar and username links so only name underlines on hover }
 *           <div className="flex items-center gap-2">
 *             <Link
 *               href={`/users/${author.username}`}
 *               onClick={(e) => e.stopPropagation()}
 *               className="block"
 *             >
 *               <UserAvatar src={author.avatarUrl} alt={author.name} size="sm" />
 *             </Link>
 *
 *             <span className="text-xs text-neutral-400">
 *               by {" "}
 *               <Link
 *                 href={`/users/${author.username}`}
 *                 onClick={(e) => e.stopPropagation()}
 *                 className="text-neutral-300 hover:underline"
 *               >
 *                 {author.username}
 *               </Link>
 *             </span>
 *           </div>
 *           
 *           {/* Stats }
 *           <div className="flex items-center gap-3 text-xs text-neutral-500">
 *             <span className="flex items-center gap-1">
 *               <Film size={12} />
 *               {list.itemCount}
 *             </span>
 *             <span className={cn("flex items-center gap-1", list.savedByMe ? "text-emerald-400" : "")}> 
 *               <Bookmark size={12} />
 *               {formatCount(list.saveCount)}
 *             </span>
 *           </div>
 *         </div>
 *       </div>
 *     </article>
 *   );
 * }
 */
export function ListPreviewCard({
  list,
  author,
  posterUrls,
  posterLinkToList = false,
  className,
  ...props
}: ListPreviewCardProps) {
  const posters = (posterUrls || []).filter(Boolean);
  const posterCount = posters.length;

  type PosterItem = string | { poster_url?: string | null; slug?: string | null };
  const getSrc = (p: PosterItem) => (typeof p === "string" ? p : p?.poster_url);
  const getSlug = (p: PosterItem) => (typeof p === "string" ? undefined : p?.slug);
  const getPosterLink = (p: PosterItem) => (posterLinkToList ? `/list/${list.id}` : (getSlug(p) ? `/movies/${getSlug(p)}` : undefined));
  return (
    <article
      className={cn("", className)}
      {...props}
    >
      <div className="group block">
        {/* Poster Collage: support 1,2,3+ posters */}
        <div className="h-48 w-full rounded-xl overflow-hidden border border-neutral-800 group-hover:border-brand-500/50 transition-colors shadow-lg">
          {posterCount <= 1 && (
            <div className="relative h-full w-full bg-neutral-900">
              {(() => {
                const src = getSrc(posters[0]) ?? undefined;
                const link = getPosterLink(posters[0]);
                const inner = (
                  <PosterSlot src={src} alt={list.title} sizes="(max-width: 768px) 100vw, 50vw" />
                );
                return link ? (
                  <Link href={link} className="relative inset-0 block h-full w-full">{inner}</Link>
                ) : (
                  inner
                );
              })()}
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors pointer-events-none" />
            </div>
          )}

          {posterCount === 2 && (
            <div className="h-full w-full flex">
              <div className="w-1/2 h-full relative bg-neutral-900">
                  {(() => {
                    const src = getSrc(posters[0]) ?? undefined;
                  const link = getPosterLink(posters[0]);
                  const inner = <PosterSlot src={src} alt={list.title} sizes="(max-width: 768px) 50vw, 25vw" />;
                  return link ? <Link href={link} className="relative inset-0 block h-full w-full">{inner}</Link> : inner;
                })()}
              </div>
              <div className="w-1/2 h-full relative bg-neutral-900 border-l border-neutral-900">
                  {(() => {
                    const src = getSrc(posters[1]) ?? undefined;
                    const link = getPosterLink(posters[1]);
                    const inner = <PosterSlot src={src} alt="" sizes="(max-width: 768px) 50vw, 25vw" />;
                    return link ? <Link href={link} className="relative inset-0 block h-full w-full">{inner}</Link> : inner;
                  })()}
              </div>
            </div>
          )}

          {posterCount >= 3 && (
            <div className="h-full w-full flex">
              {/* Main large poster */}
              <div className="w-2/3 h-full relative bg-neutral-900">
                  {(() => {
                    const src = getSrc(posters[0]) ?? undefined;
                  const link = getPosterLink(posters[0]);
                  const inner = <PosterSlot src={src} alt={list.title} sizes="(max-width: 768px) 66vw, 33vw" />;
                  return link ? <Link href={link} className="relative inset-0 block h-full w-full">{inner}</Link> : inner;
                })()}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors pointer-events-none" />
              </div>
              {/* Two smaller posters stacked */}
              <div className="w-1/3 h-full flex flex-col border-l border-neutral-900">
                <div className="h-1/2 relative border-b border-neutral-900 bg-neutral-900">
                  {(() => {
                    const src = getSrc(posters[1]) ?? undefined;
                    const link = getPosterLink(posters[1]);
                    const inner = <PosterSlot src={src} alt="" sizes="(max-width: 768px) 33vw, 15vw" />;
                    return link ? <Link href={link} className="relative inset-0 block h-full w-full">{inner}</Link> : inner;
                  })()}
                </div>
                <div className="h-1/2 relative bg-neutral-900">
                  {(() => {
                    const src = getSrc(posters[2]) ?? undefined;
                    const link = getPosterLink(posters[2]);
                    const inner = <PosterSlot src={src} alt="" sizes="(max-width: 768px) 33vw, 15vw" />;
                    return link ? <Link href={link} className="relative inset-0 block h-full w-full">{inner}</Link> : inner;
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="mt-3 px-1">
          <h3 className="font-bold text-lg text-white transition-colors truncate flex items-center gap-2">
            <Link href={`/list/${list.id}`} className="group-hover:text-brand-400 truncate flex items-center gap-2">
              <span className="truncate">{list.title}</span>
              {!list.isPublic && (
                <Lock size={14} className="text-neutral-500" />
              )}
            </Link>
          </h3>
        </div>
      </div>

      {/* Info (author & stats) moved outside the clickable/link area so hovering author doesn't trigger list hover) */}
      <div className="mt-1 px-1">
        <div className="flex items-center justify-between mt-1">
          {/* Author: separate avatar and username links so only name underlines on hover */}
          <div className="flex items-center gap-2">
            <Link
              href={`/users/${author.username}`}
              onClick={(e) => e.stopPropagation()}
              className="block"
            >
              <UserAvatar src={author.avatarUrl} alt={author.name} size="sm" />
            </Link>

            <span className="text-xs text-neutral-400">
              by {" "}
              <Link
                href={`/users/${author.username}`}
                onClick={(e) => e.stopPropagation()}
                className="text-neutral-300 hover:underline"
              >
                {author.username}
              </Link>
            </span>
          </div>
          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-neutral-500">
            <span className="flex items-center gap-1">
              <Film size={12} />
              {list.itemCount}
            </span>
            <span className={cn("flex items-center gap-1", list.savedByMe ? "text-emerald-400" : "")}> 
              <Bookmark size={12} />
              {formatCount(list.saveCount)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function formatCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}
