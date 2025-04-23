// hook
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useMutation, useQuery } from "react-query";
import { useLocation, useNavigate, useParams } from "react-router-dom";

// component
import Breadcrumb from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// utils
import settledHandler from "@/helper/settledHandler";
import ApiService from "@/lib/ApiService";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import ToastBody from "@/components/ToastBody";
import { Switch } from "@/components/ui/switch";
import ImageRepository from "@/components/ImageRepository";
import IMG_TYPE from "@/helper/img-type";
import CONTENT_TYPE from "@/helper/content-type";
import { ContentType } from "@/types/content";
import { useEffect } from "react";

import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { CategoryType } from "../NewsCategory/NewsCategory";
import Ckeditor5 from "@/components/Ckeditor5";
import combineImageMultiLang from "@/helper/combineImageMultiLang";

const title_page = "News";
const action_context = "Update";

const formSchema = z.object({
  meta_title: z.object({
    en: z.string({ required_error: "Field required" }).min(1),
    id: z.string({ required_error: "Field required" }).min(1),
  }),
  meta_description: z.object({
    en: z.string({ required_error: "Field required" }).min(1),
    id: z.string({ required_error: "Field required" }).min(1),
  }),
  thumbnail_images_en: z.string().array().default([]),
  thumbnail_images_id: z.string().array().default([]),
  images_en: z.string().array().default([]),
  images_id: z.string().array().default([]),

  title: z.object({
    en: z.string({ required_error: "Field required" }).min(1),
    id: z.string({ required_error: "Field required" }).min(1),
  }),
  description: z.object({
    en: z.string({ required_error: "Field required" }).min(1),
    id: z.string({ required_error: "Field required" }).min(1),
  }),
  small_text: z.object({
    en: z.string({ required_error: "Field required" }).min(1),
    id: z.string({ required_error: "Field required" }).min(1),
  }),
  // bottom_button_name: z.object({
  //   en: z.string({required_error: "Field required"}).min(1),
  //   id: z.string({required_error: "Field required"}).min(1),
  // }),
  // bottom_button_route: z.string({required_error: "Field required"}).min(1),
  category_id: z.string({ required_error: "Field required" }).min(1),
  active_status: z.boolean().default(false),
  type: z.string().default(CONTENT_TYPE.NEWS),
  order: z.number().default(0),
});

type DataFormValue = z.infer<typeof formSchema>;
type Payload = Omit<DataFormValue, "thumbnail_images" | "images"> & {
  type: string;
  content_id: string;
  thumbnail_images:
    | {
        id: string;
        en: string;
      }[]
    | [];
  images:
    | {
        id: string;
        en: string;
      }[]
    | [];
};

const NewsUpdate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const prevLocation = location.pathname.split("/").slice(0, 3).join("/");
  const breadcrumbItems = [
    { title: title_page, link: prevLocation },
    { title: title_page + " " + action_context, link: location.pathname },
  ];

  const form = useForm<DataFormValue>({
    resolver: zodResolver(formSchema),
  });

  const { mutate, isLoading } = useMutation(
    async (payload: Payload) =>
      await ApiService.secure().post("/content/edit", payload),
    {
      onSettled: (response) =>
        settledHandler({
          response,
          contextAction: action_context,
          onFinish: () => navigate(prevLocation),
        }),
    }
  );

  const { data: categoryOptions } = useQuery({
    queryKey: ["category-option"],
    queryFn: async () =>
      await getCategoryHandler({ pageIndex: 0, pageSize: 200 }),
  });

  const getCategoryHandler = async ({
    pageIndex,
    pageSize,
  }: {
    pageIndex: number;
    pageSize: number;
  }) => {
    try {
      const response = await ApiService.secure().get(`/category`, {
        page: pageIndex + 1,
        limit: pageSize,
        type: CONTENT_TYPE.NEWS,
      });

      if (response.data.status !== 200) {
        throw new Error(response.data.err);
      }

      return response.data.data as CategoryType[] | [];
    } catch (error: any) {
      toast.error(
        <ToastBody
          title="an error occurred"
          description={error.message || "Something went wrong"}
        />
      );
    }
  };

  const onSubmit = async (data: DataFormValue) => {
    try {
      // Handle empty thumbnail_images
      const thumbnail_images =
        data.thumbnail_images_en && data.thumbnail_images_en.length > 0
          ? combineImageMultiLang(
              data.thumbnail_images_en,
              data.thumbnail_images_id
            )
          : [];

      // Handle empty images
      const images =
        data.images_en && data.images_en.length > 0
          ? combineImageMultiLang(data.images_en, data.images_id)
          : [];

      mutate({
        ...data,
        content_id: id || "",
        images: images,
        thumbnail_images: thumbnail_images,
      });
    } catch (error: any) {
      toast.error(
        <ToastBody
          title="an error occurred"
          description={error.message || "Something went wrong"}
        />
      );
    }
  };

  useEffect(() => {
    const getDetails = async () => {
      try {
        const response = await ApiService.secure().get(`/content/detail/${id}`);
        if (response.data.status !== 200) {
          throw new Error(response.data.message);
        }

        const result: ContentType = response.data.data;

        // Safely extract image IDs with null checks
        const thumbnailImagesEn =
          result.thumbnail_images && result.thumbnail_images.length > 0
            ? result.thumbnail_images
                .map((img) => (img.en && img.en._id ? img.en._id : ""))
                .filter((id) => id !== "")
            : [];

        const thumbnailImagesId =
          result.thumbnail_images && result.thumbnail_images.length > 0
            ? result.thumbnail_images
                .map((img) => (img.id && img.id._id ? img.id._id : ""))
                .filter((id) => id !== "")
            : [];

        const imagesEn =
          result.images && result.images.length > 0
            ? result.images
                .map((img) => (img.en && img.en._id ? img.en._id : ""))
                .filter((id) => id !== "")
            : [];

        const imagesId =
          result.images && result.images.length > 0
            ? result.images
                .map((img) => (img.id && img.id._id ? img.id._id : ""))
                .filter((id) => id !== "")
            : [];

        form.reset({
          active_status: result.active_status,
          description: result.description || { en: "", id: "" },
          title: result.title || { en: "", id: "" },
          meta_title: result.meta_title || { en: "", id: "" },
          meta_description: result.meta_description || { en: "", id: "" },
          category_id: result?.category_id?._id || "",
          small_text: result.small_text || { en: "", id: "" },
          order: result.order || 0,
          thumbnail_images_en: thumbnailImagesEn,
          thumbnail_images_id: thumbnailImagesId,
          images_en: imagesEn,
          images_id: imagesId,
        });
      } catch (error: any) {
        toast.error(
          <ToastBody
            title="an error occurred"
            description={error.message || "Something went wrong"}
          />
        );
      }
    };
    getDetails();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section>
      <Breadcrumb items={breadcrumbItems} />
      <section className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">
          {action_context} {title_page}
        </h1>
        <Button onClick={() => navigate(prevLocation)}>
          Back to {title_page}
        </Button>
      </section>
      <Separator />

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col w-full mt-5 space-y-4"
        >
          <h4 className="pb-2 text-lg font-medium border-b border-primary/10">
            Meta Fields
          </h4>
          <Controller
            control={form.control}
            name="meta_title.en"
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Meta Title (EN)
                </label>
                <Input
                  id={field.name}
                  ref={field.ref}
                  type="text"
                  placeholder="Enter meta title"
                  disabled={isLoading}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
                {error?.message ? (
                  <p className="text-xs font-medium text-destructive">
                    {error?.message}
                  </p>
                ) : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="meta_description.en"
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Meta Description (EN)
                </label>
                <Textarea
                  id={field.name}
                  ref={field.ref}
                  placeholder="Enter meta description"
                  disabled={isLoading}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
                {error?.message ? (
                  <p className="text-xs font-medium text-destructive">
                    {error?.message}
                  </p>
                ) : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="meta_title.id"
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Meta Title (ID)
                </label>
                <Input
                  id={field.name}
                  ref={field.ref}
                  type="text"
                  placeholder="Enter meta title"
                  disabled={isLoading}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
                {error?.message ? (
                  <p className="text-xs font-medium text-destructive">
                    {error?.message}
                  </p>
                ) : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="meta_description.id"
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Meta Description (ID)
                </label>
                <Textarea
                  id={field.name}
                  ref={field.ref}
                  placeholder="Enter meta description"
                  disabled={isLoading}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
                {error?.message ? (
                  <p className="text-xs font-medium text-destructive">
                    {error?.message}
                  </p>
                ) : null}
              </div>
            )}
          />
          <h4 className="pb-2 text-lg font-medium border-b border-primary/10">
            Content Fields
          </h4>
          <Controller
            control={form.control}
            name="title.en"
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Title (EN)
                </label>
                <Input
                  id={field.name}
                  ref={field.ref}
                  type="text"
                  placeholder="Enter title"
                  disabled={isLoading}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
                {error?.message ? (
                  <p className="text-xs font-medium text-destructive">
                    {error?.message}
                  </p>
                ) : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="title.id"
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Title (ID)
                </label>
                <Input
                  id={field.name}
                  ref={field.ref}
                  type="text"
                  placeholder="Enter title"
                  disabled={isLoading}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
                {error?.message ? (
                  <p className="text-xs font-medium text-destructive">
                    {error?.message}
                  </p>
                ) : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor="category"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Category
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        {
                          "text-muted-foreground": !field.value,
                        },
                        "justify-between font-normal"
                      )}
                    >
                      {field.value
                        ? categoryOptions?.find(
                            (option) => option._id === field.value
                          )?.name.en
                        : "Select category"}
                      <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command>
                      <CommandInput placeholder="Search name..." />
                      <CommandList>
                        <CommandEmpty>No option found.</CommandEmpty>
                        <CommandGroup>
                          {categoryOptions?.map((option) => (
                            <CommandItem
                              key={option.name.en}
                              value={option.name.en}
                              onSelect={() => {
                                field.onChange(option._id);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === option._id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {option.name.en}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {form?.formState?.errors?.category_id ? (
                  <p className="text-xs font-medium text-destructive">
                    {form.formState.errors.category_id.message}
                  </p>
                ) : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="small_text.en"
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Thumbnail Description (EN)
                </label>
                <Textarea
                  id={field.name}
                  ref={field.ref}
                  placeholder="Enter description"
                  disabled={isLoading}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
                {error?.message ? (
                  <p className="text-xs font-medium text-destructive">
                    {error?.message}
                  </p>
                ) : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="small_text.id"
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Thumbnail Description (ID)
                </label>
                <Textarea
                  id={field.name}
                  ref={field.ref}
                  placeholder="Enter description"
                  disabled={isLoading}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
                {error?.message ? (
                  <p className="text-xs font-medium text-destructive">
                    {error?.message}
                  </p>
                ) : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="description.en"
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Body (EN)
                </label>
                <Ckeditor5
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Enter Body"
                />
                {error?.message ? (
                  <p className="text-xs font-medium text-destructive">
                    {error?.message}
                  </p>
                ) : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="description.id"
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Body (ID)
                </label>
                <Ckeditor5
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Enter Body"
                />
                {error?.message ? (
                  <p className="text-xs font-medium text-destructive">
                    {error?.message}
                  </p>
                ) : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="thumbnail_images_en"
            render={({ field }) => {
              return (
                <ImageRepository
                  label="Thumbnail"
                  limit={1}
                  mobileSize={false}
                  img_type={IMG_TYPE.NEWS}
                  value={field.value?.length ? field.value : []}
                  onChange={(data) => {
                    let value = data.map((img) => img._id);
                    form.setValue("thumbnail_images_id", value);
                    field.onChange(value);
                  }}
                />
              );
            }}
          />
          <Controller
            control={form.control}
            name="images_en"
            render={({ field }) => {
              return (
                <ImageRepository
                  label="Banner"
                  limit={1}
                  mobileSize={false}
                  img_type={IMG_TYPE.NEWS}
                  value={field.value?.length ? field.value : []}
                  onChange={(data) => {
                    let value = data.map((img) => img._id);
                    form.setValue("images_id", value);
                    field.onChange(value);
                  }}
                />
              );
            }}
          />

          <Controller
            control={form.control}
            name="order"
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Order
                </label>
                <Input
                  type="Name"
                  {...field}
                  placeholder="Enter order"
                  onKeyPress={(event) => {
                    if (!/[0-9]/.test(event.key)) {
                      event.preventDefault();
                    }
                  }}
                  disabled={isLoading}
                  onChange={(e) => {
                    field.onChange(+e.target.value);
                  }}
                />
                {error?.message ? (
                  <p className="text-xs font-medium text-destructive">
                    {error?.message}
                  </p>
                ) : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="active_status"
            defaultValue={false}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Switch
                  id={field.name}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Publish
                </label>
              </div>
            )}
          />

          <div className="flex justify-center">
            <div className="flex gap-4 mt-5 mb-10">
              <Button
                className="w-[100px]"
                type="button"
                variant={"outline"}
                onClick={() => navigate(prevLocation)}
              >
                Back
              </Button>
              <Button className="w-[100px]" size={"sm"} isLoading={isLoading}>
                Submit
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </section>
  );
};

export default NewsUpdate;
