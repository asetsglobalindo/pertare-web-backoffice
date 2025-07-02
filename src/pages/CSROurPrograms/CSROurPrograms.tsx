// hook
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";

// component
import Breadcrumb from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

// utils
import ApiService from "@/lib/ApiService";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import ToastBody from "@/components/ToastBody";
import CONTENT_TYPE from "@/helper/content-type";
import { ContentType } from "@/types/content";
import React, { useEffect, useState } from "react";
import IMG_TYPE from "@/helper/img-type";
import ImageRepository from "@/components/ImageRepository";
import combineImageMultiLang from "@/helper/combineImageMultiLang";
import Ckeditor5 from "@/components/Ckeditor5";
import { Textarea } from "@/components/ui/textarea";
import { Trash, Plus, Edit, Eye, MoreHorizontal } from "lucide-react";
import PopConfirm from "@/components/PopConfirm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import CSRSocialServices, {
  CSRSocialProgram,
  CSRSocialCreateRequest,
} from "@/services/csrSocial";
import Cookies from "js-cookie";
import setupDebugInterceptors from "@/lib/debugApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const title_page = "About Profile Page";

const formSchema = z.object({
  meta_title: z.object({
    en: z.string({ required_error: "Field required" }).min(1),
    id: z.string({ required_error: "Field required" }).min(1),
  }),
  meta_description: z.object({
    en: z.string({ required_error: "Field required" }).min(1),
    id: z.string({ required_error: "Field required" }).min(1),
  }),
  title: z.object({
    en: z.string({ required_error: "Field required" }).min(1),
    id: z.string({ required_error: "Field required" }).min(1),
  }),
  banner_en: z.string().array().default([]),
  banner_id: z.string().array().default([]),
  page_title: z.object({
    en: z.string({ required_error: "Field required" }).min(1),
    id: z.string({ required_error: "Field required" }).min(1),
  }),
  body: z
    .object({
      title: z.object({
        en: z.string({ required_error: "Field required" }).min(1),
        id: z.string({ required_error: "Field required" }).min(1),
      }),
      text: z.object({
        en: z.string({ required_error: "Field required" }).min(1),
        id: z.string({ required_error: "Field required" }).min(1),
      }),
      type: z.number().optional().default(1), // 1 mean section top
      image_en: z
        .string({ required_error: "Field required" })
        .array()
        .default([]),
      image_id: z
        .string({ required_error: "Field required" })
        .array()
        .default([]),
    })
    .array()
    .default([]),
  tab: z
    .object({
      title: z.object({
        en: z.string({ required_error: "Field required" }).min(0).default(""),
        id: z.string({ required_error: "Field required" }).min(0).default(""),
      }),
      text: z.object({
        en: z.string({ required_error: "Field required" }),
        id: z.string({ required_error: "Field required" }),
      }),
      type: z.number().optional().default(1), // 1 mean section top
      image_en: z
        .string({ required_error: "Field required" })
        .array()
        .default([]),
      image_id: z
        .string({ required_error: "Field required" })
        .array()
        .default([]),
    })
    .array()
    .default([]),
  active_status: z.boolean().default(true),
  type: z.string().default(CONTENT_TYPE.CSR_LIST),
  order: z.number().default(0),
});

type DataFormValue = z.infer<typeof formSchema>;

const CSROurPrograms = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [id, setId] = useState<string | null>(null);
  const [idTab, setIdTab] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // CSR Social Management States
  const [csrSocialPrograms, setCsrSocialPrograms] = useState<
    CSRSocialProgram[]
  >([]);
  const [csrSocialLoading, setCsrSocialLoading] = useState<boolean>(false);
  const [showCSRModal, setShowCSRModal] = useState<boolean>(false);
  const [editingCSRProgram, setEditingCSRProgram] =
    useState<CSRSocialProgram | null>(null);
  const [csrSearchQuery, setCsrSearchQuery] = useState<string>("");
  const [csrPage, setCsrPage] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>("page-content");

  const prevLocation = location.pathname.split("/").slice(0, 3).join("/");
  const breadcrumbItems = [{ title: title_page, link: prevLocation }];

  const form = useForm<DataFormValue>({
    resolver: zodResolver(formSchema),
  });

  const {
    fields: fieldsTab,
    remove: removeTab,
    append: appendTab,
  } = useFieldArray({
    name: "tab",
    control: form.control,
  });
  const { fields, remove, append } = useFieldArray({
    name: "body",
    control: form.control,
  });

  // Check authentication
  const checkAuth = () => {
    const token = Cookies.get("token");
    console.log("Auth token:", token ? "Available" : "Missing");

    if (!token) {
      toast.error(
        <ToastBody
          title="Authentication Required"
          description="Please login to access CSR management"
        />
      );
      return false;
    }
    return true;
  };

  // Test CSR API manually
  const testCSRAPI = async () => {
    try {
      console.log("Testing CSR API...");

      // Test different parameter combinations
      console.log("=== Testing various GET parameters ===");

      // Test 1: No parameters
      const test1 = await CSRSocialServices.getAll({});
      console.log("Test 1 - No params:", test1.data);

      // Test 2: Just pagination
      const test2 = await CSRSocialServices.getAll({
        page: 1,
        limit: 20,
      });
      console.log("Test 2 - Pagination only:", test2.data);

      // Test 3: With show_single_language
      const test3 = await CSRSocialServices.getAll({
        page: 1,
        limit: 20,
        show_single_language: "yes",
      });
      console.log("Test 3 - With show_single_language:", test3.data);

      // Test 4: With active_status filter
      const test4 = await CSRSocialServices.getAll({
        page: 1,
        limit: 20,
        active_status: true,
      });
      console.log("Test 4 - With active_status=true:", test4.data);

      // Test 5: Without active_status filter
      const test5 = await CSRSocialServices.getAll({
        page: 1,
        limit: 20,
        active_status: undefined,
      });
      console.log("Test 5 - Without active_status filter:", test5.data);
    } catch (error) {
      console.error("Test Error:", error);
    }
  };

  // CSR Social Management Functions
  const loadCSRSocialPrograms = async () => {
    if (!checkAuth()) return;

    try {
      setCsrSocialLoading(true);
      console.log("Loading CSR Social Programs...");

      const response = await CSRSocialServices.getAll({
        page: csrPage,
        limit: 20,
        query: csrSearchQuery || undefined,
        show_single_language: "yes",
      });

      console.log("CSR Social API Response:", response);

      if (response.data.status === 200) {
        const programs = response.data.data || [];
        setCsrSocialPrograms(programs);
        console.log("CSR Social Programs loaded:", programs);

        if (programs.length === 0) {
          console.log("No CSR Social programs found");
        }
      } else {
        throw new Error(response.data.message || "Failed to load programs");
      }
    } catch (error: any) {
      console.error("Error loading CSR Social Programs:", error);

      // Show detailed error information
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      const errorStatus = error.response?.status || "Unknown";

      console.error("Error details:", {
        status: errorStatus,
        message: errorMessage,
        response: error.response?.data,
      });

      toast.error(
        <ToastBody
          title="Error loading CSR programs"
          description={`${errorStatus}: ${errorMessage}`}
        />
      );
    } finally {
      setCsrSocialLoading(false);
    }
  };

  const handleDeleteCSRProgram = async (id: string) => {
    try {
      const response = await CSRSocialServices.delete(id);
      if (response.data.status === 200) {
        toast.success(
          <ToastBody
            title="Success"
            description="Program deleted successfully"
          />
        );
        loadCSRSocialPrograms();
      }
    } catch (error: any) {
      toast.error(
        <ToastBody
          title="Error"
          description={error.message || "Failed to delete program"}
        />
      );
    }
  };

  const handleToggleCSRStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await CSRSocialServices.toggleStatus(id, !currentStatus);
      if (response.data.status === 200) {
        toast.success(
          <ToastBody
            title="Success"
            description="Status updated successfully"
          />
        );
        loadCSRSocialPrograms();
      }
    } catch (error: any) {
      toast.error(
        <ToastBody
          title="Error"
          description={error.message || "Failed to update status"}
        />
      );
    }
  };

  const openCSRModal = (program?: CSRSocialProgram) => {
    setEditingCSRProgram(program || null);
    setShowCSRModal(true);
  };

  const closeCSRModal = () => {
    setShowCSRModal(false);
    setEditingCSRProgram(null);
  };

  const onSubmit = async (data: DataFormValue) => {
    try {
      setIsLoading(true);

      const body = data.body.map((item) => ({
        title: {
          en: item.title.en,
          id: item.title.id,
        },
        text: {
          en: item.text.en,
          id: item.text.id,
        },
        type: item.type,
        images: combineImageMultiLang(item.image_en, item.image_id),
      }));

      const bodyTab = data.tab.map((item) => ({
        title: {
          en: item.title.en,
          id: item.title.id,
        },
        text: {
          en: item.text.en,
          id: item.text.id,
        },
        type: item.type,
        images: item.image_en.length
          ? combineImageMultiLang(item.image_en, item.image_en)
          : [],
      }));

      const banner = combineImageMultiLang(data.banner_en, data.banner_id);

      const programsResponse = await ApiService.secure().post(
        id ? "/content/edit" : "/content",
        {
          ...data,
          banner: banner,
          content_id: id || "",
          body: [...body],
          type: CONTENT_TYPE.CSR_LIST,
          meta_title: {
            id: data.meta_title?.id ?? "",
            en: data.meta_title?.en ?? "",
          },
          meta_description: {
            id: data.meta_description?.id ?? "",
            en: data.meta_description?.en ?? "",
          },
        }
      );
      if (programsResponse.data.status !== 200) {
        throw new Error(programsResponse.data.message);
      }

      const tabsResponse = await ApiService.secure().post(
        idTab ? "/content/edit" : "/content",
        {
          ...data,
          banner: [],
          title: {
            en: data.title.en + " - Tab",
            id: data.title.id + " - Tab",
          },
          content_id: idTab || "",
          body: [...bodyTab],
          type: CONTENT_TYPE.CSR_CONTENT,
          meta_title: {
            id: data.tab[0]?.title.id ?? "",
            en: data.tab[0]?.title.en ?? "",
          },
          meta_description: {
            id: data.tab[0]?.text.id ?? "",
            en: data.tab[0]?.text.en ?? "",
          },
        }
      );
      if (tabsResponse.data.status !== 200) {
        throw new Error(tabsResponse.data.message);
      }

      toast.success(
        <ToastBody title="success" description="update successfully" />
      );
      setIsLoading(false);
    } catch (error) {
      toast.error(
        <ToastBody title="an error occurred" description={error as string} />
      );
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "csr-social") {
      // Setup debug interceptors on first load
      setupDebugInterceptors();
      testCSRAPI();
      loadCSRSocialPrograms();
    }
  }, [activeTab, csrPage, csrSearchQuery]);

  useEffect(() => {
    const getDetails = async (type: string) => {
      try {
        const params = {
          limit: 1,
          page: 1,
          type: type,
        };

        const response = await ApiService.get("/content", params);

        if (response.data.status !== 200) {
          throw new Error(response.data.message);
        }

        return response.data.data as ContentType[] | [];
      } catch (error: any) {
        toast.error(
          <ToastBody
            title="an error occurred"
            description={error.message || "Something went wrong"}
          />
        );
      }
    };

    getDetails(CONTENT_TYPE.CSR_LIST).then((data) => {
      if (data?.length) {
        const result: ContentType = data[0];
        setTimeout(() => {
          form.reset({
            meta_title: {
              en: result?.meta_title?.en || "",
              id: result?.meta_title?.id || "",
            },
            meta_description: {
              en: result?.meta_description?.en || "",
              id: result?.meta_description?.id || "",
            },
            active_status: true,
            title: {
              en: result?.title.en,
              id: result?.title.id,
            },
            type: CONTENT_TYPE.ABOUT_PROFILE,
            body: result.body
              .filter((d) => d.type === 1)
              .map((item) => ({
                image_en: item.images.map((img) => img.en._id) || [],
                image_id: item.images.map((img) => img.id._id) || [],
                text: {
                  en: item.text.en,
                  id: item.text.id,
                },
                title: {
                  en: item.title.en,
                  id: item.title.id,
                },
                type: item.type,
              })),
            banner_en: result.banner.map((img) => img.en._id) || [],
            banner_id: result.banner.map((img) => img.id._id) || [],
            page_title: {
              en: result?.page_title?.en || "",
              id: result?.page_title?.id || "",
            },
            order: 1,
          });
        }, 500);
        setId(result._id);
      }
    });
    getDetails(CONTENT_TYPE.CSR_CONTENT).then((data) => {
      if (data?.length) {
        const result: ContentType = data[0];

        setTimeout(() => {
          form.reset({
            tab: result.body
              .filter((d) => d.type === 1)
              .map((item) => ({
                image_en: item.images.map((img) => img.en._id) || [],
                image_id: item.images.map((img) => img.id._id) || [],
                text: {
                  en: item.text.en,
                  id: item.text.id,
                },
                title: {
                  en: item.title.en,
                  id: item.title.id,
                },
                type: item.type,
              })),
          });
        }, 300);

        setIdTab(result._id);
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section>
      <Breadcrumb items={breadcrumbItems} />
      <section className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">{title_page}</h1>
        <Button onClick={() => navigate(prevLocation)}>
          Back to {title_page}
        </Button>
      </section>
      <Separator />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-5">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="page-content">Page Content</TabsTrigger>
          <TabsTrigger value="csr-social">CSR Social Programs</TabsTrigger>
        </TabsList>

        <TabsContent value="page-content" className="mt-5">
          <FormProvider {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col w-full mt-5 space-y-4"
            >
              <React.Fragment>
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
              </React.Fragment>
              <React.Fragment>
                <h4 className="pb-2 text-lg font-medium border-b border-primary/10">
                  Banner
                </h4>
                <Controller
                  control={form.control}
                  name={"banner_en"}
                  render={({ field }) => {
                    return (
                      <ImageRepository
                        label="Banner"
                        limit={1}
                        img_type={IMG_TYPE.CSR_PAGE}
                        value={field.value?.length ? field.value : []}
                        onChange={(data) => {
                          let value = data.map((img) => img._id);
                          form.setValue("banner_id", value);
                          field.onChange(value);
                        }}
                      />
                    );
                  }}
                />
                <Controller
                  control={form.control}
                  name="page_title.id"
                  render={({ field, fieldState: { error } }) => (
                    <div className="flex flex-col space-y-2">
                      <label
                        htmlFor={field.name}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Page Title (ID)
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
                  name="page_title.en"
                  render={({ field, fieldState: { error } }) => (
                    <div className="flex flex-col space-y-2">
                      <label
                        htmlFor={field.name}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Page Title (EN)
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
              </React.Fragment>
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

              <h4 className="pb-2 text-lg font-medium border-b border-primary/10">
                Tab Section
              </h4>
              <section className="p-4 space-y-6 border">
                {fieldsTab.map((item, index) => (
                  <div
                    key={item.id}
                    className="pb-8 space-y-4 border-b border-primary/10 "
                  >
                    <div className="flex justify-between space-x-4">
                      <Controller
                        control={form.control}
                        name={`tab.${index}.title.en`}
                        render={({ field, fieldState: { error } }) => (
                          <div className="flex flex-col w-full space-y-2">
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
                      <div className="mt-auto ">
                        <PopConfirm onOk={() => removeTab(index)}>
                          <Button type="button" variant="destructive">
                            <Trash size={14} />
                          </Button>
                        </PopConfirm>
                      </div>
                    </div>

                    <Controller
                      control={form.control}
                      name={`tab.${index}.title.id`}
                      render={({ field, fieldState: { error } }) => (
                        <div className="flex flex-col w-full space-y-2">
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
                      name={`tab.${index}.text.en`}
                      render={({ field, fieldState: { error } }) => (
                        <div className="flex flex-col w-full space-y-2">
                          <label
                            htmlFor={field.name}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Text (EN) (optional)
                          </label>
                          <Ckeditor5
                            onBlur={field.onBlur}
                            ref={field.ref}
                            placeholder="Enter text"
                            value={field.value}
                            onChange={(e) => field.onChange(e)}
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
                      name={`tab.${index}.text.id`}
                      render={({ field, fieldState: { error } }) => (
                        <div className="flex flex-col w-full space-y-2">
                          <label
                            htmlFor={field.name}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Text (ID) (optional)
                          </label>
                          <Ckeditor5
                            onBlur={field.onBlur}
                            ref={field.ref}
                            placeholder="Enter text"
                            value={field.value}
                            onChange={(e) => field.onChange(e)}
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
                      name={`tab.${index}.image_en`}
                      render={({ field }) => {
                        return (
                          <ImageRepository
                            label="Image"
                            mobileSize={false}
                            img_type={IMG_TYPE.CSR_PAGE}
                            value={field.value?.length ? field.value : []}
                            onChange={(data) => {
                              let value = data.map((img) => img._id);
                              form.setValue(`tab.${index}.image_id`, value);
                              field.onChange(value);
                            }}
                          />
                        );
                      }}
                    />
                  </div>
                ))}

                <div className="">
                  <Button
                    className="mt-2"
                    type="button"
                    onClick={() =>
                      appendTab({
                        title: { en: "", id: "" },
                        image_en: [],
                        image_id: [],
                        type: 1,
                        text: { en: "", id: "" },
                      })
                    }
                  >
                    Add Fields
                  </Button>
                </div>
              </section>
              <h4 className="pb-2 text-lg font-medium border-b border-primary/10">
                Programs Section
              </h4>
              <section className="p-4 space-y-6 border">
                {fields.map((item, index) => (
                  <div
                    key={item.id}
                    className="pb-8 space-y-4 border-b border-primary/10 "
                  >
                    <div className="flex justify-between space-x-4">
                      <Controller
                        control={form.control}
                        name={`body.${index}.title.en`}
                        render={({ field, fieldState: { error } }) => (
                          <div className="flex flex-col w-full space-y-2">
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
                      <div className="mt-auto ">
                        <PopConfirm onOk={() => remove(index)}>
                          <Button type="button" variant="destructive">
                            <Trash size={14} />
                          </Button>
                        </PopConfirm>
                      </div>
                    </div>

                    <Controller
                      control={form.control}
                      name={`body.${index}.title.id`}
                      render={({ field, fieldState: { error } }) => (
                        <div className="flex flex-col w-full space-y-2">
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
                      name={`body.${index}.text.en`}
                      render={({ field, fieldState: { error } }) => (
                        <div className="flex flex-col w-full space-y-2">
                          <label
                            htmlFor={field.name}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Text (EN)
                          </label>
                          <Ckeditor5
                            onBlur={field.onBlur}
                            ref={field.ref}
                            placeholder="Enter text"
                            value={field.value}
                            onChange={(e) => field.onChange(e)}
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
                      name={`body.${index}.text.id`}
                      render={({ field, fieldState: { error } }) => (
                        <div className="flex flex-col w-full space-y-2">
                          <label
                            htmlFor={field.name}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Text (ID)
                          </label>
                          <Ckeditor5
                            onBlur={field.onBlur}
                            ref={field.ref}
                            placeholder="Enter text"
                            value={field.value}
                            onChange={(e) => field.onChange(e)}
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
                      name={`body.${index}.image_en`}
                      render={({ field }) => {
                        return (
                          <ImageRepository
                            label="Image"
                            limit={1}
                            mobileSize={false}
                            img_type={IMG_TYPE.CSR_PAGE}
                            value={field.value?.length ? field.value : []}
                            onChange={(data) => {
                              let value = data.map((img) => img._id);
                              form.setValue(`body.${index}.image_id`, value);
                              field.onChange(value);
                            }}
                          />
                        );
                      }}
                    />
                  </div>
                ))}

                <div className="">
                  <Button
                    className="mt-2"
                    type="button"
                    onClick={() =>
                      append({
                        title: { en: "", id: "" },
                        image_en: [],
                        image_id: [],
                        type: 1,
                        text: { en: "", id: "" },
                      })
                    }
                  >
                    Add Fields
                  </Button>
                </div>
              </section>

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
                  <Button
                    className="w-[100px]"
                    size={"sm"}
                    isLoading={isLoading}
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </form>
          </FormProvider>
        </TabsContent>

        <TabsContent value="csr-social" className="mt-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Search programs..."
                  value={csrSearchQuery}
                  onChange={(e) => setCsrSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log("Manual refresh clicked");
                    loadCSRSocialPrograms();
                  }}
                >
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log("Test API clicked");
                    testCSRAPI();
                  }}
                >
                  Test API
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    console.log("Simple GET test...");
                    try {
                      const response = await CSRSocialServices.getAll({});
                      console.log("Simple GET result:", response.data);
                    } catch (error) {
                      console.error("Simple GET error:", error);
                    }
                  }}
                >
                  Simple GET
                </Button>
                <Button onClick={() => openCSRModal()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add CSR Program
                </Button>
              </div>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csrSocialLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : csrSocialPrograms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No CSR programs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    csrSocialPrograms.map((program) => (
                      <TableRow key={program._id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">
                              {program.title.id}
                            </div>
                            <div className="text-sm text-gray-500">
                              {program.title.en}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="truncate">
                              {program.description.id}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {program.description.en}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={program.active_status}
                              onCheckedChange={() =>
                                handleToggleCSRStatus(
                                  program._id,
                                  program.active_status
                                )
                              }
                            />
                            <Badge
                              variant={
                                program.active_status ? "default" : "secondary"
                              }
                            >
                              {program.active_status ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{program.order}</TableCell>
                        <TableCell>
                          {new Date(program.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => openCSRModal(program)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDeleteCSRProgram(program._id)
                                }
                                className="text-red-600"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {showCSRModal && (
        <CSRSocialModal
          program={editingCSRProgram}
          onClose={closeCSRModal}
          onSuccess={() => {
            loadCSRSocialPrograms();
            closeCSRModal();
          }}
        />
      )}
    </section>
  );
};

// CSR Social Modal Component
interface CSRSocialModalProps {
  program: CSRSocialProgram | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CSRSocialModal: React.FC<CSRSocialModalProps> = ({
  program,
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const csrSchema = z.object({
    title: z.object({
      id: z.string().min(1, "Indonesian title is required"),
      en: z.string().min(1, "English title is required"),
    }),
    description: z.object({
      id: z.string().min(1, "Indonesian description is required"),
      en: z.string().min(1, "English description is required"),
    }),
    images_id: z
      .array(z.string())
      .max(1, "Maximum 1 image allowed")
      .default([]),
    images_en: z
      .array(z.string())
      .max(1, "Maximum 1 image allowed")
      .default([]),
    active_status: z.boolean().default(true),
    order: z.number().min(0, "Order must be a positive number"),
    meta_title: z
      .object({
        id: z.string().optional(),
        en: z.string().optional(),
      })
      .optional(),
    meta_description: z
      .object({
        id: z.string().optional(),
        en: z.string().optional(),
      })
      .optional(),
  });

  type CSRFormData = z.infer<typeof csrSchema>;

  const form = useForm<CSRFormData>({
    resolver: zodResolver(csrSchema),
    defaultValues: program
      ? {
          title: program.title || { id: "", en: "" },
          description: program.description || { id: "", en: "" },
          images_id: program.images?.map((img) => img.id) || [],
          images_en: program.images?.map((img) => img.en) || [],
          active_status: program.active_status ?? true,
          order: program.order || 0,
          meta_title: program.meta_title || { id: "", en: "" },
          meta_description: program.meta_description || { id: "", en: "" },
        }
      : {
          title: { id: "", en: "" },
          description: { id: "", en: "" },
          images_id: [],
          images_en: [],
          active_status: true,
          order: 0,
          meta_title: { id: "", en: "" },
          meta_description: { id: "", en: "" },
        },
  });

  const onSubmit = async (data: CSRFormData) => {
    try {
      setIsLoading(true);

      const payload: CSRSocialCreateRequest = {
        title: data.title,
        description: data.description,
        images: combineImageMultiLang(
          data.images_en || [],
          data.images_id || []
        ),
        active_status: data.active_status,
        order: data.order,
        meta_title: {
          id: data.meta_title?.id ?? "",
          en: data.meta_title?.en ?? "",
        },
        meta_description: {
          id: data.meta_description?.id ?? "",
          en: data.meta_description?.en ?? "",
        },
      };

      console.log("Submitting CSR payload:", payload);

      if (program) {
        const updateResponse = await CSRSocialServices.update(
          program._id,
          payload
        );
        console.log("Update response:", updateResponse.data);
        toast.success(
          <ToastBody
            title="Success"
            description="Program updated successfully"
          />
        );
      } else {
        const createResponse = await CSRSocialServices.create(payload);
        console.log("Create response:", createResponse.data);
        toast.success(
          <ToastBody
            title="Success"
            description="Program created successfully"
          />
        );
      }

      // Wait a bit before refreshing to ensure data is saved
      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (error: any) {
      console.error("CSR submit error:", error);
      toast.error(
        <ToastBody
          title="Error"
          description={
            error.response?.data?.message ||
            error.message ||
            "Something went wrong"
          }
        />
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {program ? "Edit CSR Program" : "Create CSR Program"}
          </DialogTitle>
          <DialogDescription>
            Fill in the form below to manage CSR social programs
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                control={form.control}
                name="title.id"
                render={({ field, fieldState: { error } }) => (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Title (Indonesian)
                    </label>
                    <Input {...field} placeholder="Enter Indonesian title" />
                    {error && (
                      <p className="text-xs text-red-500">{error.message}</p>
                    )}
                  </div>
                )}
              />

              <Controller
                control={form.control}
                name="title.en"
                render={({ field, fieldState: { error } }) => (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Title (English)
                    </label>
                    <Input {...field} placeholder="Enter English title" />
                    {error && (
                      <p className="text-xs text-red-500">{error.message}</p>
                    )}
                  </div>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                control={form.control}
                name="description.id"
                render={({ field, fieldState: { error } }) => (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Description (Indonesian)
                    </label>
                    <Textarea
                      {...field}
                      placeholder="Enter Indonesian description"
                    />
                    {error && (
                      <p className="text-xs text-red-500">{error.message}</p>
                    )}
                  </div>
                )}
              />

              <Controller
                control={form.control}
                name="description.en"
                render={({ field, fieldState: { error } }) => (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Description (English)
                    </label>
                    <Textarea
                      {...field}
                      placeholder="Enter English description"
                    />
                    {error && (
                      <p className="text-xs text-red-500">{error.message}</p>
                    )}
                  </div>
                )}
              />
            </div>

            <Controller
              control={form.control}
              name="images_en"
              render={({ field }) => (
                <ImageRepository
                  label="Program Image (Max 1)"
                  limit={1}
                  img_type={IMG_TYPE.CSR_PAGE}
                  value={field.value || []}
                  onChange={(data) => {
                    // Ensure only 1 image is selected
                    const value = (data || [])
                      .slice(0, 1)
                      .map((img) => img._id);
                    form.setValue("images_id", value);
                    field.onChange(value);
                  }}
                />
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                control={form.control}
                name="order"
                render={({ field, fieldState: { error } }) => (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Order</label>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                      placeholder="Display order"
                    />
                    {error && (
                      <p className="text-xs text-red-500">{error.message}</p>
                    )}
                  </div>
                )}
              />

              <Controller
                control={form.control}
                name="active_status"
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span>{field.value ? "Active" : "Inactive"}</span>
                    </div>
                  </div>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading}>
                {program ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default CSROurPrograms;
