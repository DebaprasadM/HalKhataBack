import { ThermalPrinter, PrinterTypes, CharacterSet } from "node-thermal-printer";

interface PrintOrder {
  invoiceNo: string;
  createdAt: Date | string;
  customer?: { name?: string | null; phone?: string | null } | null;
  paymentMethod?: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  items: { productName?: string | null; product?: { name?: string } | null; quantity: number; unitPrice: number; totalPrice: number }[];
}

export async function thermalPrint(order: PrintOrder): Promise<void> {
  const interfaceStr = process.env.PRINTER_INTERFACE || "usb";

  const printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: interfaceStr,
    characterSet: CharacterSet.PC437_USA,
    removeSpecialCharacters: false,
    options: { timeout: 10000 },
  });

  const isConnected = await printer.isPrinterConnected();
  if (!isConnected) {
    throw new Error(`Printer not found at interface: ${interfaceStr}`);
  }

  printer.clear();

  const d = new Date(order.createdAt);
  const dateStr = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  // Header
  printer.alignCenter();
  printer.bold(true);
  printer.println("HALKHATA");
  printer.bold(false);
  printer.println("Invoice");
  printer.newLine();

  // Info section - left/right aligned
  printer.alignLeft();
  printer.leftRight("Invoice:", order.invoiceNo);
  printer.leftRight("Date:", `${dateStr} ${timeStr}`);
  printer.leftRight("Customer:", order.customer?.name || "Walk-in");
  if (order.customer?.phone) printer.leftRight("Phone:", order.customer.phone);
  printer.leftRight("Payment:", order.paymentMethod || "N/A");
  printer.newLine();

  // Items header
  printer.drawLine();
  printer.tableCustom([
    { text: "Item", align: "LEFT", width: 0.5 },
    { text: "Qty", align: "CENTER", width: 0.15 },
    { text: "Price", align: "RIGHT", width: 0.15 },
    { text: "Total", align: "RIGHT", width: 0.2 },
  ]);
  printer.drawLine();

  // Items
  order.items.forEach((item) => {
    const name = (item.product?.name || item.productName || "-").substring(0, 22);
    printer.tableCustom([
      { text: name, align: "LEFT", width: 0.5 },
      { text: String(item.quantity), align: "CENTER", width: 0.15 },
      { text: `₹${Number(item.unitPrice).toFixed(2)}`, align: "RIGHT", width: 0.15 },
      { text: `₹${Number(item.totalPrice).toFixed(2)}`, align: "RIGHT", width: 0.2 },
    ]);
  });

  printer.drawLine();

  // Totals
  printer.leftRight("Subtotal:", `₹${Number(order.subtotal).toFixed(2)}`);
  if (Number(order.discount) > 0) {
    printer.leftRight("Discount:", `-₹${Number(order.discount).toFixed(2)}`);
  }
  if (Number(order.tax) > 0) {
    printer.leftRight("Tax:", `+₹${Number(order.tax).toFixed(2)}`);
  }

  printer.drawLine();
  printer.bold(true);
  printer.leftRight("TOTAL", `₹${Number(order.total).toFixed(2)}`);
  printer.bold(false);
  printer.drawLine();

  printer.newLine();
  printer.alignCenter();
  printer.println("Thank you for your business!");
  printer.newLine();

  printer.cut();
  await printer.execute();
}
