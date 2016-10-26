import sched
import time
from client.fetchjob import FetchJob
from django.core.management.base import BaseCommand, CommandError

class Command(BaseCommand):

    help = ('Runs a job that fetches data from the server.')

    __MAX_ITER = 100

    def __iterate(self, scheduler, iteration=0):
        FetchJob().run()
        if iteration < self.__MAX_ITER:
            scheduler.enter(2, 1, self.__iterate, (scheduler, iteration+1))

    def handle(self, *args, **options):
        scheduler = sched.scheduler(time.time, time.sleep)
        print 'Starting the fetch data job. Ctrl+C to exit.'
        scheduler.enter(2, 1, self.__iterate, (scheduler,))
        scheduler.run()
