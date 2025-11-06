import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const exportToImage = async (
  elementId: string,
) => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("找不到要导出的元素");
  }

  // 临时隐藏不需要导出的元素（如编辑按钮）
  const editButtons = element.querySelectorAll("[data-no-export]");
  editButtons.forEach((btn) => {
    (btn as HTMLElement).style.display = "none";
  });

  // 生成canvas
  const canvas = await html2canvas(element, {
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false,
    width: element.scrollWidth,
    height: element.scrollHeight,
  });

  // 恢复隐藏的元素
  editButtons.forEach((btn) => {
    (btn as HTMLElement).style.display = "";
  });

  // 创建Image
  const imgData = canvas.toDataURL("image/png");
  return {
    canvas,
    imgData
  };
};

export const exportToFile = async (
  elementId: string,
  filename: string,
) => {
  try {
  const {imgData} = await exportToImage(elementId);
    const link = document.createElement("a");
    link.href = imgData;
    link.download = filename;
    link.click();
  } catch (error) {
    console.error("导出文件失败:", error);
    alert("导出文件失败，请重试");
  }
};

export const exportToPDF = async (
  elementId: string,
  filename: string,
  gap = 0
) => {
  try {
    const {canvas, imgData} = await exportToImage(elementId);

    // 创建PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 210; // A4宽度
    const pageHeight = 295; // A4高度
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const dgap = (gap * imgWidth) / canvas.width; // 按比例调整间隙
    let heightLeft = imgHeight;

    let position = 0;

    // 添加第一页
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight - 25);
    heightLeft = heightLeft - pageHeight - dgap;

    // 如果内容超过一页，添加更多页面
    while (heightLeft > 10) {
      position = heightLeft - imgHeight; // 计算下一页的位置
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight - 25);
      heightLeft = heightLeft - pageHeight - dgap;
    }

    // 下载PDF
    pdf.save(filename);
  } catch (error) {
    console.error("导出PDF失败:", error);
    alert("导出PDF失败，请重试");
  }
};
