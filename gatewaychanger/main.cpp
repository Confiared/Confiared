#include <QCoreApplication>
#include "ProcessControler.h"

int main(int argc, char *argv[])
{
    QCoreApplication a(argc, argv);
    ProcessControler p;

    return a.exec();
}
