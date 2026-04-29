import PhotoSlideshow from "@/components/PhotoSlideshow";

export default function TmpTestPage() {
  return (
    <div style={{ padding: 40 }}>
      <PhotoSlideshow
        images={[
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='red'/%3E%3C/svg%3E",
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='blue'/%3E%3C/svg%3E",
        ]}
        className="h-52 w-52"
      />
    </div>
  );
}
