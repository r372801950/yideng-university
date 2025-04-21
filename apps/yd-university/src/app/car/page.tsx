// export async function getStaticProps(){
//   console.log('getStaticProps 正在执行！');
//   const req = await fetch('/api/cars');
//   const car = await req.json();
//   return {
//     props: {car}
//   }
// }

// export default function CarPage({car}) {
//   return <h1>{car.make}</h1>;
// };
export default async function CarPage() {
  console.log('getStaticProps 正在执行！');
  // const req = await fetch('http://localhost:3000/api/cars', { cache: 'force-cache' });// 默认ssg
  const req = await fetch('http://localhost:3000/api/cars', { cache: 'no-store' });// ssr
  // const req = await fetch('http://localhost:3000/api/cars', { next: { revalidate: 10 } });// ISR
  const car = await req.json();
  return (
    <div>
      <h1>{car.make} {car.model}</h1>
      <p>Year: {car.year}</p>
      <p>Color: {car.color}</p>
      <p>Price: ${car.price}</p>
    </div>
  );
};